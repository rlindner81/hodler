import { Context, Status } from "../deps.ts";
import { getMarketHistory, getMarketQuotes } from "../util/tradier.ts";

const TIMEOUT_LIVE_CACHE = 60 * 1000; // 1 min
const TIMEOUT_HISTORIC_CACHE = 604800 * 1000; // 1 week
const HISTORIC_DAY_SCAN_GAP = 10;

type Cache = Record<string, number | null>;

const liveQuoteCache: Cache = {};
const historicQuoteCache: Cache = {};

const readWriteCache = async (
  cache: Cache,
  key: string,
  callback: (key: string) => Promise<number | null>,
  timeout: number,
) => {
  if (Object.prototype.hasOwnProperty.call(cache, key)) {
    return cache[key];
  }
  cache[key] = await callback(key);
  setTimeout(() => {
    Reflect.deleteProperty(cache, key);
  }, timeout);
  return cache[key];
};

const _getLivePrice = async (symbol: string) => {
  const { quotes: { quote: results } } = await getMarketQuotes([symbol]);
  if (results === undefined || Array.isArray(results)) {
    return null;
  }
  const { close, last } = results;
  return close === null ? last : close;
};

const getLiveQuotes = async (ctx: Context) => {
  const { symbols } = await ctx.request.body({ type: "json" }).value;
  return await Promise.all(
    symbols.map(
      async (
        symbol: string,
      ) => [
        symbol,
        await readWriteCache(
          liveQuoteCache,
          symbol,
          _getLivePrice,
          TIMEOUT_LIVE_CACHE,
        ),
      ],
    ),
  );
};

const _getHistoricPrice = async (input: string) => {
  const [date, symbol] = input.split("##");
  const [, year, month, day] = /(\d{4})-(\d{2})-(\d{2})/.exec(date) ||
    [];
  const endDate = new Date(
    Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)),
  );
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - HISTORIC_DAY_SCAN_GAP);
  const response = await getMarketHistory(symbol, startDate, endDate);
  const results = response?.history?.day;
  if (results === undefined) {
    return null;
  }
  const { close } = results[results.length - 1];
  return close;
};

const getHistoricQuotes = async (ctx: Context) => {
  const { symbols, date } = await ctx.request.body({ type: "json" }).value;
  return await Promise.all(
    symbols.map(
      async (
        symbol: string,
      ) => [
        symbol,
        await readWriteCache(
          historicQuoteCache,
          date + "##" + symbol,
          _getHistoricPrice,
          TIMEOUT_HISTORIC_CACHE,
        ),
      ],
    ),
  );
};

export { getHistoricQuotes, getLiveQuotes };
