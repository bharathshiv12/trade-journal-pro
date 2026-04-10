import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useLivePrices = () => {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-live-prices");
      if (error) throw error;
      if (data?.prices) {
        setPrices(data.prices);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch live prices:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    // Refresh every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { prices, loading, lastUpdated, refetch: fetchPrices };
};
