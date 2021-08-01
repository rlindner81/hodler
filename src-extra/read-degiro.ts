import {
  parse as parseCsv,
} from "https://deno.land/std@0.103.0/encoding/csv.ts";
import table from "./table.ts";

const readCsvData = async (files: string[], doFix = false) => {
  const result = (<string[][]>[]).concat(
    ...await Promise.all(
      files.map(async (file) => {
        const inputData = await Deno.readTextFile(file);
        // ,,,S...,,,,,,,,8ec0-5d687df53bc2
        const fixedInputData = doFix ? inputData.replace(/\n,,,[^,]*,,,,,,,,/g, "") : inputData;
        return (<string[]>await parseCsv(fixedInputData)).slice(1).reverse();
      }),
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
  "temp/degiro-bookings-2017-Account.csv",
  "temp/degiro-bookings-2018-Account.csv",
  "temp/degiro-bookings-2019-Account.csv",
  "temp/degiro-bookings-2020-Account.csv",
  "temp/degiro-bookings-2021-ongoing-Account.csv",
];

const transactionFiles = [
  "temp/degiro-Transactions-2017.csv",
  "temp/degiro-Transactions-2020.csv",
  "temp/degiro-Transactions-2021-ongoing.csv",
];

const accountDataRaw = await readCsvData(accountFiles, true);
const transactionDataRaw = await readCsvData(transactionFiles);

const checkCurrency = (currencies: string[], whitelist: string[]) => {
  if (
    currencies.filter(
      (currency) => currency && !whitelist.includes(currency),
    ).length !== 0
  ) {
    console.error("got unexpected currency: %O", currencies);
    debugger;
  }
};

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
    "Einrichtung von Handelsmodalitäten",
  ];

  // Datum,Uhrze,Valutadatum,Produkt,ISIN,Beschreibung,FX,Änderung,,Saldo,,Order-ID
  return data.map(
    (
      [
        date,
        time,
        valuaDate,
        product,
        isin,
        descriptionRaw,
        fx,
        changeCurrency,
        changeRaw,
        totalCurrency,
        totalRaw,
        orderId,
      ],
    ) => {
      const [, day, month, year] = /^(\d{2})-(\d{2})-(\d{4})$/.exec(date) ?? [];
      const [, hour, minute] = /^(\d{2}):(\d{2})$/.exec(time) ?? [];
      const timestamp = new Date(
        Date.UTC(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hour),
          parseInt(minute),
        ),
      );
      if (isNaN(timestamp.getTime())) {
        console.error("wrong date/time detected");
        debugger;
      }
      const change = changeRaw ? parseFloat(changeRaw.replace(",", ".")) : null;
      const total = totalRaw ? parseFloat(totalRaw.replace(",", ".")) : null;
      const [, description] =
      new RegExp(`^(${descriptionTypes.join("|")}|.*).*?$`).exec(
        descriptionRaw,
      ) ?? [];
      descriptions.add(description);

      checkCurrency([changeCurrency, totalCurrency], ["PLN", "USD", "EUR"]);
      return {
        timestamp,
        product,
        isin,
        description,
        change,
        changeCurrency,
        total,
        totalCurrency,
        orderId,
      };
    },
  );
};

const processTransactionData = (data: string[][]) => {
  // Datum,Uhrzeit,Produkt,ISIN,Referenzbörse,Ausführungsort,Anzahl,Kurs,,Wert in Lokalwährung,,Wert,,Wechselkurs,Transaktionskosten,,Gesamt,,Order-ID
  return data.map(
    (
      [
        date,
        time,
        product,
        isin,
        referenceExchange,
        executionExchange,
        amountRaw,
        quoteRaw,
        quoteCurrency,
        nativeWorthRaw,
        nativeWorthCurrency,
        worthRaw,
        worthCurrency,
        fxRateRaw,
        transactionCostRaw,
        transactionCostCurrency,
        totalRaw,
        totalCurrency,
        orderId,
      ],
    ) => {
      const [, day, month, year] = /^(\d{2})-(\d{2})-(\d{4})$/.exec(date) ?? [];
      const [, hour, minute] = /^(\d{2}):(\d{2})$/.exec(time) ?? [];
      const timestamp = new Date(
        Date.UTC(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hour),
          parseInt(minute),
        ),
      );
      const amount = amountRaw ? parseInt(amountRaw) : null;
      const quote = quoteRaw ? parseFloat(quoteRaw) : null;
      const localWorth = nativeWorthRaw ? parseFloat(nativeWorthRaw) : null;
      const worth = worthRaw ? parseFloat(worthRaw) : null;
      const fxRate = fxRateRaw ? parseFloat(fxRateRaw) : null;
      const transactionCost = transactionCostRaw
        ? parseFloat(transactionCostRaw)
        : null;
      const total = totalRaw ? parseFloat(totalRaw) : null;

      if (
        fxRate &&
        (String(fxRate) + "000").slice(0, fxRateRaw.length) !== fxRateRaw
      ) {
        console.error("error precision problem %s !== %s", fxRate, fxRateRaw);
        debugger;
      }
      checkCurrency([quoteCurrency, nativeWorthCurrency], ["USD", "EUR"]);
      checkCurrency([worthCurrency, transactionCostCurrency, totalCurrency], [
        "EUR",
      ]);
      return {
        timestamp,
        product,
        isin,
        amount,
        quote,
        quoteCurrency,
        localWorth,
        localWorthCurrency: nativeWorthCurrency,
        worth,
        worthCurrency,
        transactionCost,
        transactionCostCurrency,
        total,
        totalCurrency,
        fxRate,
        orderId,
      };
    },
  );
};

const accountData = processAccountData(accountDataRaw);
const transactionData = processTransactionData(transactionDataRaw);

const writeTableToFile = async (filename: string, data: any[]) => {
  console.log("writing file %s", filename);
  const headerRow = <any[]>Object.keys(data[0]);
  const tableData = [headerRow].concat(
    data.map((entry) => Object.values(entry).map((part: any) => part === null ? "" : part))
  );

  await Deno.writeTextFile(filename, table(tableData, {
    sortCol: null,
  }) ?? "");
  console.log("finished with file %s", filename);
}

await writeTableToFile("temp/accountData.txt", accountData);
await writeTableToFile("temp/transactionData.txt", transactionData);

const i = 0;
