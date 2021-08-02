import {
  parse as parseCsv,
} from "https://deno.land/std@0.103.0/encoding/csv.ts";
import table from "./table.ts";

const accountFiles = [
  "temp/raw/degiro-bookings-2017-Account.csv",
  "temp/raw/degiro-bookings-2018-Account.csv",
  "temp/raw/degiro-bookings-2019-Account.csv",
  "temp/raw/degiro-bookings-2020-Account.csv",
  "temp/raw/degiro-bookings-2021-ongoing-Account.csv",
];

const transactionFiles = [
  "temp/raw/degiro-Transactions-2017.csv",
  "temp/raw/degiro-Transactions-2020.csv",
  "temp/raw/degiro-Transactions-2021-ongoing.csv",
];

const accountCatgories = [
  {
    name: "CASH_LOAD",
    tester: [/^(?:flatex )?Einzahlung$/]
  },
  {
    name: "CASH_UNLOAD",
    tester: [/^(?:flatex )?Auszahlung$/]
  },
  {
    name: "CASH_PROCESSING",
    tester: ["Processed Flatex Withdrawal"]
  },
  {
    name: "DIVIDENDE",
    tester: [
      "Dividende",
      "Dividendensteuer",
      "Wiederveranlagung Dividende",
    ]
  },
  {
    name: "STOCK_BUY",
    tester: [/^Kauf/]
  },
  {
    name: "STOCK_SELL",
    tester: [/^Verkauf/]
  },
  {
    name: "STOCK_SYMBOL_CHANGE",
    tester: [/^ISIN-ÄNDERUNG/]
  },
  {
    name: "CASH_EXCHANGE",
    tester: [/^Währungswechsel \((?:Einbuchung|Ausbuchung)\)$/]
  },
  {
    name: "TRANSACTION_COST",
    tester: ["Transaktionsgebühr"]
  },
  {
    name: "MONEY_FUND_OLD",
    tester: [/^Geldmarktfonds/]
  },
  {
    name: "MONEY_FUND",
    tester: [
      "Degiro Cash Sweep Transfer",
      /^Überweisung auf Ihr Geldkonto bei der flatex Bank:.*$/,
      /^Auszahlung von Ihrem Geldkonto bei der flatex Bank:.*$/,
    ]
  },
];

const readCsvData = async (files: string[], doAccountDataFix = false) => {
  const result = (<string[][]>[]).concat(
    ...await Promise.all(
      files.map(async (file) => {
        const inputData = await Deno.readTextFile(file);
        // ,,,S...,,,,,,,,8ec0-5d687df53bc2
        const fixedInputData = doAccountDataFix ? inputData.replace(/\n,,,[^,]*,,,,,,,,/g, "") : inputData;
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
  let lastTotalCache: Record<string, number> = {};
  // Datum,Uhrze,Valutadatum,Produkt,ISIN,Beschreibung,FX,Änderung,,Saldo,,Order-ID
  return data.map(
    (
      [
        date,
        time,
        , //valuaDate,
        product,
        isin,
        description,
        , //fx,
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
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
      );
      if (isNaN(timestamp.getTime())) {
        debugger;
        throw new Error("wrong date/time detected");
      }
      let change = changeRaw ? parseFloat(changeRaw.replace(",", ".")) : null;
      const total = totalRaw ? parseFloat(totalRaw.replace(",", ".")) : null;
      if (total === null) {
        debugger;
        throw new Error("cannot have empty total");
      }
      const lastTotal = lastTotalCache[totalCurrency] ?? 0;
      lastTotalCache[totalCurrency] = total;
      if (change === null) {
        change = parseFloat((total - lastTotal).toFixed(2));
        changeCurrency = totalCurrency
        if (
          !description.startsWith("Geldmarktfonds Umwandlung:")
          && !description.startsWith("Überweisung auf Ihr Geldkonto bei der flatex Bank:")
          && !description.startsWith("Auszahlung von Ihrem Geldkonto bei der flatex Bank:")
        ) {
          debugger;
          throw new Error("cannot have empty change");
        }
      }
      const category = accountCatgories.find(
        (category) => category.tester.filter(
          (tester) =>
            typeof tester === "string"
              ? description === tester
              : tester.test(description)
        ).length !== 0
      )?.name ?? "OTHER";

      checkCurrency([changeCurrency, totalCurrency], ["PLN", "USD", "EUR"]);
      return {
        timestamp,
        product,
        isin,
        description,
        category,
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
        , //referenceExchange,
        , //executionExchange,
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
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
      );
      const amount = amountRaw ? parseInt(amountRaw) : null;
      const quote = quoteRaw ? parseFloat(quoteRaw) : null;
      const localWorth = nativeWorthRaw ? parseFloat(nativeWorthRaw) : null;
      const worth = worthRaw ? parseFloat(worthRaw) : null;
      let fxRate = fxRateRaw ? parseFloat(fxRateRaw) : null;
      let transactionCost = transactionCostRaw
        ? parseFloat(transactionCostRaw)
        : null;
      const total = totalRaw ? parseFloat(totalRaw) : null;

      if (fxRate === null && quoteCurrency === "EUR") {
        fxRate = 1;
      }

      if (transactionCost === null) {
        transactionCost = 0;
        transactionCostCurrency = quoteCurrency
      }

      if (
        fxRateRaw && fxRate &&
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

const writeTableToFile = async (filename: string, data: any[]) => {
  console.log("writing file %s", filename);
  const headerRow = <any[]>Object.keys(data[0]);
  const tableData = [headerRow].concat(
    data.map((entry) => Object.values(entry).map((part: any) => part === null ? "<null>" : part))
  );

  await Deno.writeTextFile(filename, table(tableData, {
    sortCol: null,
  }) ?? "");
  console.log("finished with file %s", filename);
}

const writeAccountSqlToFile = async (filename: string, data: any[]) => {
  console.log("writing file %s", filename);
  const result = `
DROP TABLE IF EXISTS t_degiro_account CASCADE;
CREATE TABLE IF NOT EXISTS t_degiro_account
(
    timestamp       TIMESTAMP NOT NULL,
    product         VARCHAR(512),
    isin            VARCHAR(512),
    description     VARCHAR(512),
    category        VARCHAR(512),
    change          NUMERIC(8,2),
    changeCurrency  VARCHAR(3),
    total           NUMERIC(8,2),
    totalCurrency   VARCHAR(3),
    orderId         VARCHAR(36)
);
INSERT INTO t_degiro_account 
    (timestamp, product, isin, description, category, change, changeCurrency, total, totalCurrency, orderId) VALUES
${
    data.map(
      (entry) => "(" + Object.values(entry).map(
        (part) => {
          if (part === null) {
            return "NULL";
          }
          if (part instanceof Date) {
              return "'" + part.toISOString() + "'";
          }
          if (typeof part === "number") {
            return part;
          }
          return "'" + part + "'";
        }
      ).join(", ") + ")"
    ).join(",\n")
  }
;
`

  await Deno.writeTextFile(filename, result);
  console.log("finished with file %s", filename);
}

const accountDataRaw = await readCsvData(accountFiles, true);
const transactionDataRaw = await readCsvData(transactionFiles);

const accountData = processAccountData(accountDataRaw);
const transactionData = processTransactionData(transactionDataRaw);

await writeTableToFile("temp/parsed/degiroAccountData.txt", accountData);
await writeAccountSqlToFile("temp/parsed/degiroAccountData.sql", accountData);
await writeTableToFile("temp/parsed/degiroTransactionData.txt", transactionData);

debugger;
Deno.exit();
