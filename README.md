# hodler

## runtime

- https://deno.land/
  - https://deno.land/std
  - https://deno.land/x

```
# install
deno cache --unstable --reload src/server.ts

# run server
deno run --unstable --allow-all src/server.ts

#  run options-quotes
deno run --unstable --allow-all src/misc/options-quotes.ts
```

## data source

- https://stooq.com/db/h/

## dependencies

- https://github.com/hayd/deno-udd

```
# update setup
deno install -A -f -n udd https://deno.land/x/udd@0.5.0/main.ts

# update dependencies
udd src/**/*.ts
deno cache --unstable --reload src/server.ts

# format files
deno fmt src/**/*.ts 
```

- DnDB for persistence https://deno.land/x/dndb@0.2.2
- (soon) Postgres for persistence https://deno.land/x/postgres

# APIS
```
# https://documentation.tradier.com/brokerage-api/overview/market-data
export TRADIER_APIKEY=xxx
## us equity quotes
curl -X GET "https://sandbox.tradier.com/v1/markets/quotes?symbols=AMD" \
     -H "Authorization: Bearer ${TRADIER_APIKEY}" \
     -H 'Accept: application/json'
## us option quotes
curl -X GET "https://sandbox.tradier.com/v1/markets/quotes?symbols=AMD220121C00077500" \
     -H "Authorization: Bearer ${TRADIER_APIKEY}" \
     -H 'Accept: application/json'


export ALPHAVANTAGE_APIKEY=xxx
## german quotes
# symbol search
curl "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=cd+projekt&apikey=${ALPHAVANTAGE_APIKEY}"
# eod historic
# do outputsize=full once and then outputsize=compact for updates
curl "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=7CD.FRK&outputsize=full&apikey=${ALPHAVANTAGE_APIKEY}"
# delayed intraday
curl "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=7CD.FRK&apikey=${ALPHAVANTAGE_APIKEY}"
curl "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=2B76.FRK&apikey=${ALPHAVANTAGE_APIKEY}"

## fx
# eod historic
# do outputsize=full once and then outputsize=compact for updates
curl "https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=EUR&to_symbol=USD&outputsize=full&apikey=${ALPHAVANTAGE_APIKEY}"
# intraday
curl "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR&apikey=${ALPHAVANTAGE_APIKEY}"
```

# problems
