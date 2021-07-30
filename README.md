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

- 
- DnDB for persistence https://deno.land/x/dndb@0.2.2


# problems

- need real-time (and historic) currency exchange data source
- need real-time (and historic) fra-exchange data source

https://www.alphavantage.co/documentation/
can do german quotes e.g. 7CD.FRK => cd projekt

```
export AV_APIKEY=xxx
## german quotes
# symbol search
curl "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=cd+projekt&apikey=${AV_APIKEY}"
# eod historic
# do outputsize=full once and then outputsize=compact for updates
curl "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=7CD.FRK&outputsize=full&apikey=${AV_APIKEY}"
# delayed intraday
curl "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=7CD.FRK&apikey=${AV_APIKEY}"
curl "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=2B76.FRK&apikey=${AV_APIKEY}"

## fx
# eod historic
# do outputsize=full once and then outputsize=compact for updates
curl "https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=EUR&to_symbol=USD&outputsize=full&apikey=${AV_APIKEY}"
# intraday
curl "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR&apikey=${AV_APIKEY}"
```
