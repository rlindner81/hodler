import {
  exists
} from "https://deno.land/std@0.97.0/fs/mod.ts";


const DATA_FILE = "data-stic.json";
const TRADIER_APIKEY_ENV_VAR = "TRADIER_APIKEY";
const TRADIER_HOST = new URL("https://sandbox.tradier.com/");
const STOCKS = [
  { symbol: "BARK" },
  { symbol: "CRSR" },
  { symbol: "STOR" },
  { symbol: "BOWX" },
  { symbol: "CCL" },
  { symbol: "CCIV" },
  { symbol: "PLTR" },
  { symbol: "TWTR" },
  { symbol: "AMD" },
  { symbol: "DIS" }
  // CD PROJEKT
];


const getMarketHistory = async (symbol: string) => {
  const nowDate = new Date();
  const start = `${nowDate.getFullYear()}-01-01`;
  const end = nowDate.toISOString().slice(0, 10);
  const tradierUrl = new URL("/v1/markets/history", TRADIER_HOST);
  tradierUrl.search = new URLSearchParams({
    symbol,
    start,
    end
  }).toString();
  const headers = {
    "Accept": "application/json",
    "Authorization": `Bearer ${Deno.env.get(TRADIER_APIKEY_ENV_VAR)}`
  };
  const reponse = await fetch(tradierUrl.toString(), { headers });
  return reponse.json();
}

const getMarketQuotes = async (symbols: string) => {
  const tradierUrl = new URL("/v1/markets/quotes", TRADIER_HOST);
  tradierUrl.search = new URLSearchParams({ symbols }).toString();
  const headers = {
    "Accept": "application/json",
    "Authorization": `Bearer ${Deno.env.get(TRADIER_APIKEY_ENV_VAR)}`
  };
  const reponse = await fetch(tradierUrl.toString(), { headers });
  return reponse.json();
}

const loadData = async () => {
  if (await exists(DATA_FILE)) {
    const dataRaw = await Deno.readFile(DATA_FILE);
    const dataText = new TextDecoder("utf-8").decode(dataRaw);
    return JSON.parse(dataText);
  }

  // const symbols = STOCKS.map(({ symbol }) => symbol);
  // const data = await getMarketQuotes(symbols);

  const symbol = "STIC";
  const data = await getMarketHistory(symbol);
  const dataText = JSON.stringify(data, null, 2) + "\n";
  const dataRaw = new TextEncoder().encode(dataText);
  await Deno.writeFile(DATA_FILE, dataRaw);
  return data;
};

const main = async () => {
  const data = await loadData();
  console.log(data);
  const i = 0;
};

main();
