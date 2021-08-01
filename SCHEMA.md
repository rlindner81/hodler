# hodler schema

## init
```bash
psql -d postgres -c "CREATE ROLE hodler WITH LOGIN PASSWORD 'hodler';"
psql -d postgres -c "CREATE DATABASE hodler WITH OWNER hodler;"
psql -U hodler -d hodler < sql/01_schema_init.sql
```

## Currency
- Semantic Key
  - 3 letter ISO code
- Name

## Broker
- Semantic Key
- Name
- Money-management-type???
  - Degiro always converts to EUR
  - Banx allows holding EUR/USD seperately and doing transactions in USD
- some transaction cost info
- transaction cost currency?

## Security
- Semantic Key
  - Symbol for stocks or long symbol for options
- ISIN
- Exchange
- Native Currency
- Type
  - Option or Stock
- Underlying 
  - For options links to real stock

## Cash Transactions
- Timestamp
- [Broker]
- Purpose
- Price
- [Price Currency]
- [Security Transaction] if related

```
Timestamp,[Broker],Purpose,Price,[Price Currency],[Security Transaction]
x  ,DEGIRO  ,CASH_LOAD         ,1000  ,EUR  ,
x  ,DEGIRO  ,TRANSACTION_COST  ,-2    ,EUR  ,T1
x  ,DEGIRO  ,STOCK_BUY         ,-900  ,EUR  ,T1
x  ,DEGIRO  ,STOCK_SELL        ,900   ,EUR  ,T2
x  ,BANX    ,CASH_LOAD         ,1000  ,EUR  ,
x  ,BANX    ,CASH_SELL         ,-900  ,EUR  ,
x  ,BANX    ,CASH_BUY          ,1000  ,USD  ,
x  ,BANX    ,TRANSACTION_COST  ,-7    ,USD  ,T3
x  ,BANX    ,OPTIONS_BUY       ,-900  ,USD  ,T3
x  ,BANX    ,OPTIONS_SELL      ,900   ,USD  ,T4
```

## Security Transactions
- Timestamp
- [Broker]
- Purpose
- Amount
- Price
- [Price Currency]
- FX Rate???
- [Security]

```
Timestamp,[Broker],Purpose,Amount,Price,[Price Currency],FxRate,[Book Currency],[Security]
x  ,DEGIRO  ,STOCK_BUY    ,10   ,100  ,USD  ,1.23  ,EUR  ,AMD
x  ,DEGIRO  ,STOCK_SELL   ,-10  ,110  ,USD  ,1.30  ,EUR  ,AMD
x  ,BANX    ,OPTION_BUY   ,10   ,100  ,USD  ,1     ,USD  ,AMD220121C00077500
x  ,BANX    ,OPTION_SELL  ,-10  ,110  ,USD  ,1     ,USD  ,AMD220121C00077500
```

PRO
- find out how much cash is there (at timestamp) for any broker by columnsum
- can separte costs by purpose

TODO
- can we compute losses due to exchange rates changing efficiently?
