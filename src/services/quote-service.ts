import { Context, Status } from "../deps.ts";
import { getMarketQuotes, getMarketHistory } from "../util/tradier.ts";

const TIMEOUT_LIVE_CACHE = 60*1000; // 1 min
const TIMEOUT_HISTORIC_CACHE = 604800*1000; // 1 week

type Cache = Record<string, number>;

const liveQuoteCache: Cache = {};
const historicQuoteCache: Cache = {};

const readWriteCache = async (cache: Cache, key: string, callback: (key:string) => Promise<number|null>, timeout: number) => {
  if (Object.prototype.hasOwnProperty.call(cache, key)) {
    return cache[key];
  }
  const value = await callback(key);
  if (value === null) {
    return null;
  }
  cache[key] = value;
  setTimeout(() => {
    Reflect.deleteProperty(cache, key);
  }, timeout);
  return cache[key];
}

const _getLivePrice = async (symbol: string) => {
  const bla =  await getMarketQuotes([symbol]);;
  const { quotes: { quote: results } } = bla;
  if (results === undefined || Array.isArray(results)) {
    return null;
  }
  const { close, last } = results;
  return close === null ? last : close;
}

const getLiveQuotes = async (ctx: Context) => {
  const { symbols } = await ctx.request.body({ type: "json" }).value;
  return await Promise.all(
    symbols.map(
      async (symbol: string) =>
        [symbol, await readWriteCache(liveQuoteCache, symbol, _getLivePrice, TIMEOUT_LIVE_CACHE)]
    )
  );
};

const getHistoricQuotes = async (ctx: Context) => {
  const { symbols, date } = await ctx.request.body({ type: "json" }).value;
  const { quotes: { quote: result } } = await getMarketHistory(symbols);
  return result;
};

export { getLiveQuotes, getHistoricQuotes };
