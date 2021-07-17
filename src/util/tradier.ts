const API_KEY = Deno.env.get("TRADIER_APIKEY");
const TRADIER_HOST = new URL("https://sandbox.tradier.com/");

// TODO wrap fetch with some error handling...

interface Quote {
  symbol: string;
  bid: number;
  ask: number;
  open: number;
  high: number;
  low: number;
  close: number;
  last: number;
}

type ResponseQuotes = Record<"quotes", Record<"quote", Array<Quote>>>;
type ResponseQuote = Record<"quotes", Record<"quote", Quote>>;
let tradierToken: string | undefined;

const _getToken = () => {
  if (API_KEY === undefined) {
    throw new Error(
      `cannot find tradier api key in env var ${API_KEY}`,
    );
  }
  return API_KEY;
};

const getMarketHistory = async (
  symbol: string,
  startDate: string | Date = new Date(Date.UTC(new Date().getFullYear(), 0, 1)),
  endDate: string | Date = new Date(),
) => {
  const start = startDate instanceof Date
    ? startDate.toISOString().slice(0, 10)
    : startDate;
  const end = endDate instanceof Date
    ? endDate.toISOString().slice(0, 10)
    : endDate;
  const tradierUrl = new URL("/v1/markets/history", TRADIER_HOST);
  tradierUrl.search = new URLSearchParams({
    symbol,
    start,
    end,
  }).toString();
  const headers = {
    "Accept": "application/json",
    "Authorization": `Bearer ${_getToken()}`,
  };
  const reponse = await fetch(tradierUrl.toString(), { headers });
  return reponse.json();
};

const getMarketQuotes = async (
  symbols: Array<string>,
): Promise<ResponseQuote | ResponseQuotes> => {
  const tradierUrl = new URL("/v1/markets/quotes", TRADIER_HOST);
  tradierUrl.search = new URLSearchParams({ symbols: symbols.join(",") })
    .toString();
  const headers = {
    "Accept": "application/json",
    "Authorization": `Bearer ${_getToken()}`,
  };
  const reponse = await fetch(tradierUrl.toString(), { headers });
  return reponse.json();
};

export { getMarketHistory, getMarketQuotes };
