"use strict";

const { URL } = require("url");
const { readFile, writeFile, access } = require("fs").promises;
const { promisify } = require("util");
const fetch = require("node-fetch");

const DATA_FILE = "data-stic.json";
const TRADIER_HOST = new URL("https://sandbox.tradier.com/");
const STOCKS = [
  { symbol: "STIC" },
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


const getMarketHistory = async (symbol) => {
  const nowDate = new Date();
  const start = `${nowDate.getFullYear()}-01-01`;
  const end = nowDate.toISOString().slice(0, 10);
  const tradierUrl = new URL("/v1/markets/history", TRADIER_HOST);
  tradierUrl.search = new URLSearchParams({
    symbol,
    start,
    end
  });
  const headers = {
    "Accept": "application/json",
    "Authorization": `Bearer ${process.env.TRADIER_APIKEY}`
  };
  const reponse = await fetch(tradierUrl.toString(), { headers });
  return reponse.json();
}

const getMarketQuotes = async (symbols) => {
  const tradierUrl = new URL("/v1/markets/quotes", TRADIER_HOST);
  tradierUrl.search = new URLSearchParams({ symbols });
  const headers = {
    "Accept": "application/json",
    "Authorization": `Bearer ${process.env.TRADIER_APIKEY}`
  };
  const reponse = await fetch(tradierUrl.toString(), { headers });
  return reponse.json();
}

const loadData = async () => {
  try {
    const dataRaw = await readFile(DATA_FILE);
    return JSON.parse(dataRaw);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }

  // const symbols = STOCKS.map(({ symbol }) => symbol);
  // const data = await getMarketQuotes(symbols);

  const symbol = "STIC";
  const data = await getMarketHistory(symbol);
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  return data;
};

const main = async () => {
  const data = await loadData();
  console.log(data);
  const i = 0;
};

main();
