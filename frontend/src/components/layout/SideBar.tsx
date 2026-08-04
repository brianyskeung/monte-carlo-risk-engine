import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Simulate" },
  { to: "/backtest", label: "Backtest" },
];

export default function SideBar() {
  return (
    <nav className="w-64 flex flex-col py-6 px-4 bg-surface border-r border-black/5 shadow-sm">
      <div className="flex flex-col gap-1">
        {items.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                isActive
                  ? "bg-mint/10 text-mint"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}