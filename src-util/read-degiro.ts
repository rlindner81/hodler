import {
  parse as parseCsv,
} from "https://deno.land/std@0.82.0/encoding/csv.ts";

const readCsvData = async (files: string[]) => {
  const result = (<unknown[][]> []).concat(
    ...await Promise.all(
      files.map(async (file) =>
        (await parseCsv(await Deno.readTextFile(file))).slice(1)
      ),
    ),
  );

  for (const entry of result) {
    if (entry.length !== result[0].length) {
      console.error("entry has inconsistent lenght %O vs %O", entry, result[0]);
      debugger;
    }
  }
  return result;
};

const accountFiles = [
  "../temp/degiro-bookings-2017-Account.csv",
  "../temp/degiro-bookings-2018-Account.csv",
  "../temp/degiro-bookings-2019-Account.csv",
  "../temp/degiro-bookings-2020-Account.csv",
  "../temp/degiro-bookings-2021-ongoing-Account.csv",
];

const transactionFiles = [
  "../temp/degiro-Transactions-2017.csv",
  "../temp/degiro-Transactions-2020.csv",
  "../temp/degiro-Transactions-2021-ongoing.csv",
];

const accountData = await readCsvData(accountFiles);
const transactionData = await readCsvData(transactionFiles);

const i = 0;
