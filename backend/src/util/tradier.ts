import config from "../config.ts";

const TRADIER_HOST = new URL("https://sandbox.tradier.com/");

const {tradierKey} = config;

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

type ResponseQuotes = Array<Quote>;

const _getToken = () => {
  if (tradierKey === undefined) {
    throw new Error(
      `cannot find tradier api key in env var ${tradierKey}`,
    );
  }
  return tradierKey;
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
  const reponse = await fetch(tradierUrl.toString(), {headers});
  return reponse.json();
};

const getMarketQuotes = async (
  symbols: Array<string>,
): Promise<ResponseQuotes> => {
  if (symbols.length === 0) {
    return [];
  }
  const tradierUrl = new URL("/v1/markets/quotes", TRADIER_HOST);
  tradierUrl.search = new URLSearchParams({symbols: symbols.join(",")})
    .toString();
  const headers = {
    "Accept": "application/json",
    "Authorization": `Bearer ${_getToken()}`,
  };
  const response = await fetch(tradierUrl.toString(), {headers});
  const responseData = await response.json();
  return symbols.length === 1
    ? [responseData.quotes.quote]
    : responseData;
};


const getOptionExpirations = async (symbol: string) => {
  const tradierUrl = new URL("/v1/markets/options/expirations", TRADIER_HOST);
  tradierUrl.search = new URLSearchParams({symbol}).toString()
  const headers = {
    "Accept": "application/json",
    "Authorization": `Bearer ${_getToken()}`,
  };
  const response = await fetch(tradierUrl.toString(), {headers});
  const responseData = await response.json();
  return responseData.expirations?.date ?? null;
}

const getOptionChains = async (symbol: string, expiration: string) => {
  const tradierUrl = new URL("/v1/markets/options/chains", TRADIER_HOST);
  tradierUrl.search = new URLSearchParams({symbol, expiration}).toString()
  const headers = {
    "Accept": "application/json",
    "Authorization": `Bearer ${_getToken()}`,
  };
  const response = await fetch(tradierUrl.toString(), {headers});
  const responseData = await response.json();
  return responseData.options?.option ?? null;
}

export {getMarketHistory, getMarketQuotes, getOptionExpirations, getOptionChains};
