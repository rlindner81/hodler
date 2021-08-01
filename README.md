# hodler

get an overview of your financials. 

keep track of profit and loss including
- breakdown realized/unrealized
- breakdown across brokerages
- year to date performance
- month to date performance

formulate and update investment theses (plays) for your stocks
- predict developments and verify how well you did
- learn from past mistakes

keep track of money in all bank/brokerage accounts including
- month over month performance
- year to date performance
- invested/(cash+invested) exposure

  

## runtime

- https://deno.land/
- https://deno.land/std

```
# install
deno cache --unstable --reload src/server.ts

# run server
deno run --unstable --allow-all src/server.ts
```

## dependencies

[deps.ts](src/deps.ts)
- Oak is main server https://deno.land/x/oak
- BCrypt for password storage https://deno.land/x/bcrypt
- Validasaur for input validation https://deno.land/x/validasaur
- Postgres for persistence https://deno.land/x/postgres

### update deno dependencies
https://github.com/hayd/deno-udd
```
# setup
deno install -A -f -n udd https://deno.land/x/udd@0.5.0/main.ts

# update dependencies
udd src/**/*.ts
deno cache --unstable --reload src/server.ts
```

## APIS
### Tradier
https://documentation.tradier.com/brokerage-api/overview/market-data
```
export TRADIER_APIKEY=xxx
```

#### us equity quotes
```
curl -X GET "https://sandbox.tradier.com/v1/markets/quotes?symbols=AMD" \
     -H "Authorization: Bearer ${TRADIER_APIKEY}" \
     -H 'Accept: application/json'
```

#### us option quotes
```
curl -X GET "https://sandbox.tradier.com/v1/markets/quotes?symbols=AMD220121C00077500" \
     -H "Authorization: Bearer ${TRADIER_APIKEY}" \
     -H 'Accept: application/json'
```

### Alpha Vantage
https://www.alphavantage.co/documentation/
```
export ALPHAVANTAGE_APIKEY=xxx
```

#### german equity quotes
- symbol search
```
curl "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=cd+projekt&apikey=${ALPHAVANTAGE_APIKEY}"
```
- eod historic: do outputsize=full once and then outputsize=compact for updates
```
curl "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=7CD.FRK&outputsize=full&apikey=${ALPHAVANTAGE_APIKEY}"
```
- delayed intraday
```
curl "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=7CD.FRK&apikey=${ALPHAVANTAGE_APIKEY}"
curl "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=2B76.FRK&apikey=${ALPHAVANTAGE_APIKEY}"
```

#### currency exchange
- eod historic: do outputsize=full once and then outputsize=compact for updates
```
curl "https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=EUR&to_symbol=USD&outputsize=full&apikey=${ALPHAVANTAGE_APIKEY}"
```
- intraday
```
curl "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR&apikey=${ALPHAVANTAGE_APIKEY}"
```

## misc

### format files
```
deno fmt src/**/*.ts
deno fmt src-util/**/*.ts
```

### options quotes
```
deno run --unstable --allow-all src/misc/options-quotes.ts
deno run --unstable --allow-all src-util/misc/read-degiro.ts
```

### data source

- https://stooq.com/db/h/

## problems
