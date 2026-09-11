import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../constants/api";
import type { TickerMatch } from "../types";

const DEBOUNCE_MS = 250;

export default function useTickerSearch(query: string) {
  const [matches, setMatches] = useState<TickerMatch[]>([]);
  const trimmedQuery = query.trim();

  useEffect(() => {
    if (!trimmedQuery) {
      setMatches([]);
      return;
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      axios
        .get(`${API_URL}/api/tickers/search`, {
          params: { q: trimmedQuery, limit: 8 },
          timeout: 10000,
          signal: controller.signal,
        })
        .then((response) => {
          setMatches(response.data.matches ?? []);
        })
        .catch((error) => {
          if (axios.isCancel(error)) return;
          console.error("Failed to fetch ticker matches:", error);
          setMatches([]);
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [trimmedQuery]);

  return matches;
}
