import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CRYPTO_IDS: Record<string, string> = {
  "BTC/USD": "bitcoin",
  "ETH/USD": "ethereum",
  "SOL/USD": "solana",
  "BNB/USD": "binancecoin",
  "XRP/USD": "ripple",
  "ADA/USD": "cardano",
  "DOGE/USD": "dogecoin",
  "AVAX/USD": "avalanche-2",
  "DOT/USD": "polkadot",
  "MATIC/USD": "matic-network",
  "LINK/USD": "chainlink",
  "UNI/USD": "uniswap",
  "ATOM/USD": "cosmos",
  "FTM/USD": "fantom",
  "NEAR/USD": "near",
};

// Approximate forex rates (updated periodically, fallback values)
const FOREX_RATES: Record<string, number> = {
  "EUR/USD": 1.0850,
  "GBP/USD": 1.2650,
  "USD/JPY": 154.50,
  "AUD/USD": 0.6520,
  "USD/CAD": 1.3650,
  "NZD/USD": 0.5980,
  "USD/CHF": 0.8820,
  "EUR/GBP": 0.8580,
  "GBP/JPY": 195.40,
  "EUR/JPY": 167.60,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const prices: Record<string, number> = {};

    // Fetch crypto prices from CoinGecko (free, no key needed)
    const ids = Object.values(CRYPTO_IDS).join(",");
    const cgRes = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
    );

    if (cgRes.ok) {
      const cgData = await cgRes.json();
      for (const [symbol, id] of Object.entries(CRYPTO_IDS)) {
        if (cgData[id]?.usd) {
          prices[symbol] = cgData[id].usd;
        }
      }
    }

    // Add forex rates (static approximations - in production you'd use a forex API)
    for (const [pair, rate] of Object.entries(FOREX_RATES)) {
      prices[pair] = rate;
    }

    // Note: US/Indian stock prices would need a paid API (Alpha Vantage, Yahoo Finance, etc.)
    // For now we don't include them - the UI will handle missing prices gracefully

    return new Response(JSON.stringify({ prices, timestamp: Date.now() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching prices:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch prices", prices: {} }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
