import { validasaur } from "../deps.ts";
const { required, isString, isDate, lengthBetween, validateArray } = validasaur;

const quoteSchema = {
  tickers: validateArray(true, [isString, lengthBetween(1, 256)]),
  date: [isString, lengthBetween(10, 10), isDate],
};

export { quoteSchema };
