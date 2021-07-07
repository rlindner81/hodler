const TRADIER_APIKEY_ENV_VAR = "TRADIER_APIKEY";
const TRADIER_HOST = new URL("https://sandbox.tradier.com/");

// TODO wrap fetch with some error handling...

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
let tradierToken: string | undefined = undefined;

const _getToken = () => {
  if (tradierToken === undefined) {
    tradierToken = Deno.env.get(TRADIER_APIKEY_ENV_VAR);
    if (tradierToken === undefined) {
      throw new Error(`cannot find tradier api key in env var ${TRADIER_APIKEY_ENV_VAR}`);
    }
  }
  return tradierToken;
}

const getMarketHistory = async (symbol: string, startDate:Date = new Date(Date.UTC(new Date().getFullYear(), 0, 1)), endDate:Date = new Date()) => {
  const start = startDate.toISOString().slice(0, 10);
  const end = endDate.toISOString().slice(0, 10);
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
  // console.log(tradierUrl.toString());
  const reponse = await fetch(tradierUrl.toString(), {headers});
  return reponse.json();
};

const getMarketQuotes = async (symbols: Array<string>): Promise<Quotes> => {
  const tradierUrl = new URL("/v1/markets/quotes", TRADIER_HOST);
  tradierUrl.search = new URLSearchParams({symbols: symbols.join(",")}).toString();
  const headers = {
    "Accept": "application/json",
    "Authorization": `Bearer ${_getToken()}`,
  };
  const reponse = await fetch(tradierUrl.toString(), {headers});
  return reponse.json();
};

export {getMarketHistory, getMarketQuotes};
