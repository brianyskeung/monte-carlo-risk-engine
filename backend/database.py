"""Persistence for completed simulation runs.

The database is intentionally kept behind this small module so the API does
not depend on an ORM. Uses Turso (libSQL) when TURSO_DATABASE_URL is set,
falling back to a local SQLite file for development.

Every run belongs to an owner: an anonymous client id the frontend generates
and sends with each request. All reads, writes and deletes are scoped to that
owner, so one visitor can never see or delete another visitor's runs.
"""

import json
import os
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Generator

import libsql


DEFAULT_DATABASE_PATH = Path(__file__).parent / "data" / "simulation_runs.sqlite3"


def _database_target() -> str:
    """The Turso URL when configured, else the local SQLite file path."""
    url = os.getenv("TURSO_DATABASE_URL")
    if url:
        return url
    return str(Path(os.getenv("SIMULATION_DB_PATH", DEFAULT_DATABASE_PATH)))


def _connect() -> Any:
    """Opens a connection to Turso when configured, else to the local file."""
    target = _database_target()
    if os.getenv("TURSO_DATABASE_URL"):
        return libsql.connect(target, auth_token=os.getenv("TURSO_AUTH_TOKEN"))

    Path(target).parent.mkdir(parents=True, exist_ok=True)
    return libsql.connect(target)


def _row_to_dict(cursor: Any, row: Any) -> dict[str, Any] | None:
    """Maps one result row onto its column names."""
    if row is None:
        return None
    columns = [column[0] for column in cursor.description]
    return dict(zip(columns, row))


def _rows_to_dicts(cursor: Any) -> list[dict[str, Any]]:
    """Maps every remaining result row onto its column names."""
    columns = [column[0] for column in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


@contextmanager
def get_connection() -> Generator[Any, None, None]:
    """Connection scope that commits on success and rolls back on any error."""
    connection = _connect()
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


# databases whose schema has already been checked in this process; keyed by
# target so switching databases (e.g. between tests) still creates the schema
_initialized_targets: set[str] = set()


def initialize_database() -> None:
    """Creates the schema if needed. Runs at most once per database per process."""
    target = _database_target()
    if target in _initialized_targets:
        return
    with get_connection() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS simulation_runs (
                id INTEGER PRIMARY KEY,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                owner_id TEXT,
                name TEXT,
                tickers_json TEXT NOT NULL,
                weights_json TEXT NOT NULL,
                models_json TEXT NOT NULL,
                lookback_period TEXT NOT NULL,
                forecasted_days INTEGER NOT NULL,
                num_simulations INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS run_models (
                id INTEGER PRIMARY KEY,
                run_id INTEGER NOT NULL REFERENCES simulation_runs(id) ON DELETE CASCADE,
                model_id TEXT NOT NULL,
                display_name TEXT NOT NULL,
                expected_terminal_value REAL NOT NULL,
                expected_return REAL NOT NULL,
                loss_var_95 REAL NOT NULL,
                loss_cvar_95 REAL NOT NULL,
                simulation_time_ms REAL NOT NULL
            );
            CREATE TABLE IF NOT EXISTS run_percentile_paths (
                run_model_id INTEGER NOT NULL REFERENCES run_models(id) ON DELETE CASCADE,
                day INTEGER NOT NULL,
                p5 REAL NOT NULL,
                p25 REAL NOT NULL,
                p50 REAL NOT NULL,
                p75 REAL NOT NULL,
                p95 REAL NOT NULL,
                mean REAL NOT NULL,
                PRIMARY KEY (run_model_id, day)
            );
            CREATE INDEX IF NOT EXISTS idx_simulation_runs_created_at
                ON simulation_runs(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_run_models_run_id ON run_models(run_id);
            """
        )
        _ensure_columns(connection)
        # created after the migration, since older databases lack owner_id
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_simulation_runs_owner "
            "ON simulation_runs(owner_id, id DESC)"
        )
    _initialized_targets.add(target)


def _ensure_columns(connection: Any) -> None:
    """
    Adds columns introduced after a database was first created. Runs saved
    before owner_id existed keep a NULL owner and are not visible to anyone.
    """
    cursor = connection.execute("PRAGMA table_info(simulation_runs)")
    columns = {row[1] for row in cursor.fetchall()}
    if "name" not in columns:
        connection.execute("ALTER TABLE simulation_runs ADD COLUMN name TEXT")
    if "owner_id" not in columns:
        connection.execute("ALTER TABLE simulation_runs ADD COLUMN owner_id TEXT")


def save_run(
    owner_id: str, request: Any, results: dict[str, Any], name: str | None = None
) -> int:
    """Save one successful request and all chart data atomically, for one owner."""
    initialize_database()
    with get_connection() as connection:
        if name is not None:
            # names only need to be unique within one owner's runs
            existing = connection.execute(
                """
                SELECT 1 FROM simulation_runs
                WHERE owner_id = ? AND name IS NOT NULL AND LOWER(name) = LOWER(?)
                """,
                (owner_id, name),
            ).fetchone()
            if existing is not None:
                raise ValueError(f"A saved run named '{name}' already exists.")

        cursor = connection.cursor()
        cursor.execute(
            """
            INSERT INTO simulation_runs (
                owner_id, name, tickers_json, weights_json, models_json,
                lookback_period, forecasted_days, num_simulations
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                owner_id,
                name,
                json.dumps(request.tickers),
                json.dumps(request.weights, sort_keys=True),
                json.dumps(request.models),
                request.lookback_period,
                request.forecasted_days,
                request.num_simulations,
            ),
        )
        run_id = cursor.lastrowid

        # one row per model, each with its own percentile path points
        for model in results["models"]:
            summary = model["summary"]
            model_cursor = connection.cursor()
            model_cursor.execute(
                """
                INSERT INTO run_models (
                    run_id, model_id, display_name, expected_terminal_value,
                    expected_return, loss_var_95, loss_cvar_95, simulation_time_ms
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    run_id, model["model_id"], model["display_name"],
                    summary["expected_terminal_value"], summary["expected_return"],
                    summary["loss_var_95"], summary["loss_cvar_95"],
                    model["simulation_time_ms"],
                ),
            )
            _insert_percentile_paths(connection, model_cursor.lastrowid, model["percentile_paths"])
    return int(run_id)


# SQLite caps bound parameters per statement, so long paths are inserted in
# chunks of 900 rows (8 parameters each) rather than one statement per day.
_PERCENTILE_PATH_CHUNK_SIZE = 900


def _insert_percentile_paths(connection: Any, run_model_id: int, points: list[dict[str, Any]]) -> None:
    """Bulk-inserts the chart points for one model of one run."""
    for offset in range(0, len(points), _PERCENTILE_PATH_CHUNK_SIZE):
        chunk = points[offset:offset + _PERCENTILE_PATH_CHUNK_SIZE]
        placeholders = ", ".join(["(?, ?, ?, ?, ?, ?, ?, ?)"] * len(chunk))
        params = [
            value
            for point in chunk
            for value in (
                run_model_id, point["day"], point["p5"], point["p25"],
                point["p50"], point["p75"], point["p95"], point["mean"],
            )
        ]
        connection.execute(
            f"""
            INSERT INTO run_percentile_paths
                (run_model_id, day, p5, p25, p50, p75, p95, mean)
            VALUES {placeholders}
            """,
            params,
        )


def list_runs(owner_id: str, limit: int, offset: int) -> dict[str, Any]:
    """Returns a page of one owner's run metadata (no chart data) plus their total count."""
    initialize_database()
    with get_connection() as connection:
        total = connection.execute(
            "SELECT COUNT(*) FROM simulation_runs WHERE owner_id = ?", (owner_id,)
        ).fetchone()[0]
        cursor = connection.execute(
            """
            SELECT id, created_at, name, tickers_json, weights_json, models_json,
                   lookback_period, forecasted_days, num_simulations
            FROM simulation_runs WHERE owner_id = ?
            ORDER BY id DESC LIMIT ? OFFSET ?
            """,
            (owner_id, limit, offset),
        )
        rows = _rows_to_dicts(cursor)
    return {"total": total, "runs": [_serialize_run(row) for row in rows]}


def get_run(owner_id: str, run_id: int) -> dict[str, Any] | None:
    """
    Rebuilds one stored run into the same shape /api/simulate returns, so the
    frontend can render it with the live-result components. None if missing
    or owned by someone else.
    """
    initialize_database()
    with get_connection() as connection:
        cursor = connection.execute(
            "SELECT * FROM simulation_runs WHERE id = ? AND owner_id = ?",
            (run_id, owner_id),
        )
        run = _row_to_dict(cursor, cursor.fetchone())
        if run is None:
            return None
        models_cursor = connection.execute(
            "SELECT * FROM run_models WHERE run_id = ? ORDER BY id", (run_id,)
        )
        models = _rows_to_dicts(models_cursor)
        result_models = []
        for model in models:
            points_cursor = connection.execute(
                "SELECT day, p5, p25, p50, p75, p95, mean FROM run_percentile_paths WHERE run_model_id = ? ORDER BY day",
                (model["id"],),
            )
            points = _rows_to_dicts(points_cursor)
            result_models.append(
                {
                    "model_id": model["model_id"], "display_name": model["display_name"],
                    "summary": {
                        **{key: model[key] for key in ("expected_terminal_value", "expected_return", "loss_var_95", "loss_cvar_95")},
                        "forecasted_days": run["forecasted_days"],
                    },
                    "simulation_time_ms": model["simulation_time_ms"],
                    "percentile_paths": points,
                }
            )
    return {**_serialize_run(run), "data": {"models": result_models}}


def delete_run(owner_id: str, run_id: int) -> bool:
    """Deletes one owner's run (models and paths cascade). False if not found for that owner."""
    initialize_database()
    with get_connection() as connection:
        connection.execute(
            "DELETE FROM simulation_runs WHERE id = ? AND owner_id = ?",
            (run_id, owner_id),
        )
        changed = connection.execute("SELECT changes()").fetchone()[0]
    return changed == 1


def _serialize_run(row: dict[str, Any]) -> dict[str, Any]:
    """Expands the JSON-encoded columns of a run row back into lists/dicts."""
    return {
        "id": row["id"], "created_at": row["created_at"], "name": row["name"],
        "tickers": json.loads(row["tickers_json"]), "weights": json.loads(row["weights_json"]),
        "models": json.loads(row["models_json"]), "lookback_period": row["lookback_period"],
        "forecasted_days": row["forecasted_days"], "num_simulations": row["num_simulations"],
    }
