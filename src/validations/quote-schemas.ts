import { validasaur } from "../deps.ts";
const { required, isString, isDate, lengthBetween, validateArray } = validasaur;

const liveQuoteSchema = {
  symbols: validateArray(true, [isString, lengthBetween(1, 256)]),
};

const historicQuoteSchema = {
  symbols: validateArray(true, [isString, lengthBetween(1, 256)]),
  date: [required, isString, lengthBetween(10, 10), isDate],
};

export { historicQuoteSchema, liveQuoteSchema };
