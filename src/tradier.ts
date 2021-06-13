const TRADIER_APIKEY_ENV_VAR = "TRADIER_APIKEY";
const TRADIER_HOST = new URL("https://sandbox.tradier.com/");

interface Quote {
  symbol: string,
  bid: number,
  ask: number,
  open: number,
  high: number,
  low: number,
  close: number
}
type Quotes = Record<"quotes", Record<"quote", Array<Quote>>>;

const getMarketHistory = async (symbol: string) => {
  const nowDate = new Date();
  const start = `${nowDate.getFullYear()}-01-01`;
  const end = nowDate.toISOString().slice(0, 10);
  const tradierUrl = new URL("/v1/markets/history", TRADIER_HOST);
  tradierUrl.search = new URLSearchParams({
    symbol,
    start,
    end,
  }).toString();
  const headers = {
    "Accept": "application/json",
    "Authorization": `Bearer ${Deno.env.get(TRADIER_APIKEY_ENV_VAR)}`,
  };
  const reponse = await fetch(tradierUrl.toString(), { headers });
  return reponse.json();
};

const getMarketQuotes = async (symbols: Array<string>): Promise<Quotes> => {
  const tradierUrl = new URL("/v1/markets/quotes", TRADIER_HOST);
  tradierUrl.search = new URLSearchParams({ symbols: symbols.join(",") }).toString();
  const headers = {
    "Accept": "application/json",
    "Authorization": `Bearer ${Deno.env.get(TRADIER_APIKEY_ENV_VAR)}`,
  };
  const reponse = await fetch(tradierUrl.toString(), { headers });
  return reponse.json();
};

export { getMarketHistory, getMarketQuotes };