import {
  parse as parseCsv,
} from "https://deno.land/std@0.103.0/encoding/csv.ts";

const readCsvData = async (files: string[]) => {
  const result = (<string[][]> []).concat(
    ...await Promise.all(
      files.map(async (file) =>
        (<string[]>await parseCsv(await Deno.readTextFile(file))).slice(1).reverse()
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

const accountDataRaw = await readCsvData(accountFiles);
const transactionDataRaw = await readCsvData(transactionFiles);

const processAccountData = (data: string[][]) => {
  const descriptions = new Set();

  const descriptionTypes = [
    "Kauf",
    "Verkauf",
    "Geldmarktfonds Umwandlung: Kauf",
    "Geldmarktfonds Umwandlung: Verkauf",
    "Überweisung auf Ihr Geldkonto bei der flatex Bank",
    "Auszahlung von Ihrem Geldkonto bei der flatex Bank",
    "ISIN-ÄNDERUNG",
    "Einrichtung von Handelsmodalitäten"
  ]

  // Datum,Uhrze,Valutadatum,Produkt,ISIN,Beschreibung,FX,Änderung,,Saldo,,Order-ID
  return data.map(
    ([date, time, valuaDate, product, isin, descriptionRaw, fx, changeCurrency, changeRaw, totalCurrency, totalRaw, orderId]) => {
    const [, day, month, year] = /^(\d{2})-(\d{2})-(\d{4})$/.exec(date) ?? [];
    const [, hour, minute] = /^(\d{2}):(\d{2})$/.exec(time) ?? [];
    const timestamp = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day),  parseInt(hour),  parseInt(minute)));
    const change = parseFloat(changeRaw.replace(",", "."));
    const total = parseFloat(totalRaw.replace(",", "."));
    const [, description] = new RegExp(`^(${descriptionTypes.join("|")}|.*).*?$`).exec(descriptionRaw) ?? [];
    descriptions.add(description);
    return {
      timestamp,
      product,
      isin,
      description,
      change,
      total,
      orderId
    };
  }
  );
}

const processTransactionData = (data: string[][]) => {
  // Datum,Uhrzeit,Produkt,ISIN,Referenzbörse,Ausführungsort,Anzahl,Kurs,,Wert in Lokalwährung,,Wert,,Wechselkurs,Transaktionskosten,,Gesamt,,Order-ID
  return data.map(
    ([date, time, product, isin, referenceExchange, executionExchange, amountRaw, quoteRaw, quoteCurrency, localPriceRaw, localPriceCurrency, priceRaw, priceCurrency, fxRate, transactionCostRaw, transactionCostCurrency, totalRaw, totalCurrency, orderId]) => {
      const [, day, month, year] = /^(\d{2})-(\d{2})-(\d{4})$/.exec(date) ?? [];
      const [, hour, minute] = /^(\d{2}):(\d{2})$/.exec(time) ?? [];
      const timestamp = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day),  parseInt(hour),  parseInt(minute)));
      // const change = parseFloat(changeRaw.replace(",", "."));
      // const total = parseFloat(totalRaw.replace(",", "."));
      return {
        timestamp
      };
    }
  );
}

const accountData = processAccountData(accountDataRaw);
const transactionData = processTransactionData(transactionDataRaw);
