DROP TABLE IF EXISTS t_user CASCADE;
DROP TABLE IF EXISTS t_broker CASCADE;
DROP TABLE IF EXISTS t_currency CASCADE;
DROP TABLE IF EXISTS t_security_type CASCADE;
DROP TABLE IF EXISTS t_security CASCADE;
DROP TABLE IF EXISTS t_security_transaction_type CASCADE;
DROP TABLE IF EXISTS t_security_transaction CASCADE;
DROP TABLE IF EXISTS t_cash_transaction_type CASCADE;
DROP TABLE IF EXISTS t_cash_transaction CASCADE;

DROP DOMAIN IF EXISTS d_short_text CASCADE;
DROP DOMAIN IF EXISTS d_money CASCADE;
DROP DOMAIN IF EXISTS d_currency CASCADE;

CREATE DOMAIN d_short_text AS VARCHAR(256);
CREATE DOMAIN d_money AS NUMERIC(20, 10);
CREATE DOMAIN d_currency AS VARCHAR(3);

CREATE TABLE IF NOT EXISTS t_user
(
    identifier d_short_text PRIMARY KEY NOT NULL,
    name       d_short_text             NOT NULL
);
INSERT INTO t_user (identifier, name)
VALUES ('rlindner81@gmail.com', 'Richard')
;

CREATE TABLE IF NOT EXISTS t_currency
(
    identifier d_currency PRIMARY KEY NOT NULL,
    name       d_short_text           NOT NULL
);
INSERT INTO t_currency (identifier, name)
VALUES ('EUR', 'Euro'),
       ('USD', 'US Dollar')
;

CREATE TABLE IF NOT EXISTS t_broker
(
    identifier d_short_text PRIMARY KEY NOT NULL,
    name       d_short_text             NOT NULL
);
INSERT INTO t_broker (identifier, name)
VALUES ('DEGIRO', 'Degiro'),
       ('BANX', 'Banx Broker')
;

CREATE TABLE IF NOT EXISTS t_security_type
(
    identifier d_short_text PRIMARY KEY NOT NULL
);
INSERT INTO t_security_type (identifier)
VALUES ('STOCK'),
       ('OPTION')
;

CREATE TABLE IF NOT EXISTS t_security
(
    identifier d_short_text PRIMARY KEY                             NOT NULL,
    isin       d_short_text,
    currency   d_currency REFERENCES t_currency (identifier)        NOT NULL,
    type       d_short_text REFERENCES t_security_type (identifier) NOT NULL,
    underlying d_short_text REFERENCES t_security (identifier)      NOT NULL
);
INSERT INTO t_security (identifier, currency, type, underlying)
VALUES ('AMD', 'USD', 'STOCK', 'AMD'),
       ('AMD220121C00077500', 'USD', 'OPTION', 'AMD')
;

CREATE TABLE IF NOT EXISTS t_security_transaction_type
(
    identifier d_short_text PRIMARY KEY NOT NULL
);
INSERT INTO t_security_transaction_type (identifier)
VALUES ('STOCK_BUY'),
       ('STOCK_SELL'),
       ('OPTION_BUY'),
       ('OPTION_SELL')
;
CREATE TABLE IF NOT EXISTS t_security_transaction
(
    id            UUID PRIMARY KEY                                                 NOT NULL,
    timestamp     TIMESTAMP WITHOUT TIME ZONE                                      NOT NULL,
    broker        d_short_text REFERENCES t_broker (identifier)                    NOT NULL,
    "user"        d_short_text REFERENCES t_user (identifier)                      NOT NULL,
    type          d_short_text REFERENCES t_security_transaction_type (identifier) NOT NULL,
    amount        INTEGER                                                          NOT NULL,
    price         d_money                                                          NOT NULL,
    book_currency d_currency REFERENCES t_currency (identifier)                    NOT NULL,
    book_fx_rate  d_money                                                          NOT NULL
);


CREATE TABLE IF NOT EXISTS t_cash_transaction_type
(
    identifier d_short_text PRIMARY KEY NOT NULL
);
INSERT INTO t_cash_transaction_type (identifier)
VALUES ('CASH_LOAD'),
       ('CASH_UNLOAD'),
       ('CASH_BUY'),
       ('CASH_SELL'),
       ('STOCK_BUY'),
       ('STOCK_SELL'),
       ('OPTION_BUY'),
       ('OPTION_SELL'),
       ('TRANSACTION_COST')
;

CREATE TABLE IF NOT EXISTS t_cash_transaction
(
    id                   UUID PRIMARY KEY                                             NOT NULL,
    timestamp            TIMESTAMP WITHOUT TIME ZONE                                  NOT NULL,
    broker               d_short_text REFERENCES t_broker (identifier)                NOT NULL,
    "user"               d_short_text REFERENCES t_user (identifier)                  NOT NULL,
    type                 d_short_text REFERENCES t_cash_transaction_type (identifier) NOT NULL,
    price                d_money                                                      NOT NULL,
    security_transaction UUID REFERENCES t_security_transaction (id)
);
