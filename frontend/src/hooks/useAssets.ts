import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../constants/api";
import type { AssetInfoMap } from "../types";

export default function useAssets(tickers: string[]) {
  const [assets, setAssets] = useState<AssetInfoMap>({});

  const tickerKey = tickers
    .map((ticker) => ticker.trim().toUpperCase())
    .filter(Boolean)
    .join(",");

  useEffect(() => {
    if (!tickerKey) {
      setAssets({});
      return;
    }

    const tickerArray = tickerKey.split(",");

    axios
      .get(`${API_URL}/api/assets`, {
        timeout: 10000,
        params: {
          tickers: tickerArray,
        },
        paramsSerializer: () => {
          const searchParams = new URLSearchParams();

          tickerArray.forEach((ticker) => {
            searchParams.append("tickers", ticker);
          });

          return searchParams.toString();
        },
      })
      .then((response) => {
        setAssets(response.data.assets ?? {});
      })
      .catch((error) => {
        console.error("Failed to fetch asset information:", error);
        setAssets({});
      });
  }, [tickerKey]);

  return assets;
}
