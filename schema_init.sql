DROP TABLE IF EXISTS t_user CASCADE;
DROP TABLE IF EXISTS t_broker CASCADE;
DROP TABLE IF EXISTS t_currency CASCADE;
DROP TABLE IF EXISTS t_security_type CASCADE;
DROP TABLE IF EXISTS t_security CASCADE;
DROP TABLE IF EXISTS t_security_transaction_type CASCADE;
DROP TABLE IF EXISTS t_security_transaction CASCADE;
DROP TABLE IF EXISTS t_cash_transaction_type CASCADE;
DROP TABLE IF EXISTS t_cash_transaction CASCADE;

CREATE TABLE IF NOT EXISTS t_user
(
    identifier VARCHAR(256) PRIMARY KEY NOT NULL,
    name       VARCHAR(256)             NOT NULL
);
INSERT INTO t_user (identifier, name)
VALUES ('rlindner81@gmail.com', 'Richard')
;

CREATE TABLE IF NOT EXISTS t_currency
(
    identifier VARCHAR(3) PRIMARY KEY NOT NULL,
    name       VARCHAR(256)           NOT NULL
);
INSERT INTO t_currency (identifier, name)
VALUES ('EUR', 'Euro'),
       ('USD', 'US Dollar')
;

CREATE TABLE IF NOT EXISTS t_broker
(
    identifier VARCHAR(256) PRIMARY KEY NOT NULL,
    name       VARCHAR(256)             NOT NULL
);
INSERT INTO t_broker (identifier, name)
VALUES ('DEGIRO', 'Degiro'),
       ('BANX', 'Banx Broker')
;

CREATE TABLE IF NOT EXISTS t_security_type
(
    identifier VARCHAR(256) PRIMARY KEY NOT NULL
);
INSERT INTO t_security_type (identifier)
VALUES ('STOCK'),
       ('OPTION')
;

CREATE TABLE IF NOT EXISTS t_security
(
    identifier VARCHAR(256) PRIMARY KEY                             NOT NULL,
    isin       VARCHAR(256),
    currency   VARCHAR(256) REFERENCES t_currency (identifier)      NOT NULL,
    type       VARCHAR(256) REFERENCES t_security_type (identifier) NOT NULL,
    underlying VARCHAR(256) REFERENCES t_security (identifier)      NOT NULL
);
INSERT INTO t_security (identifier, currency, type, underlying)
VALUES ('AMD', 'USD', 'STOCK', 'AMD'),
       ('AMD220121C00077500', 'USD', 'OPTION', 'AMD')
;

CREATE TABLE IF NOT EXISTS t_security_transaction_type
(
    identifier VARCHAR(256) PRIMARY KEY NOT NULL
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
    broker        VARCHAR(256) REFERENCES t_broker (identifier)                    NOT NULL,
    "user"        VARCHAR(256) REFERENCES t_user (identifier)                      NOT NULL,
    type          VARCHAR(256) REFERENCES t_security_transaction_type (identifier) NOT NULL,
    amount        INTEGER                                                          NOT NULL,
    price         NUMERIC(20, 10)                                                  NOT NULL,
    book_currency VARCHAR(256) REFERENCES t_currency (identifier)                  NOT NULL,
    book_fx_rate  NUMERIC(20, 10)                                                  NOT NULL
);


CREATE TABLE IF NOT EXISTS t_cash_transaction_type
(
    identifier VARCHAR(256) PRIMARY KEY NOT NULL
);
INSERT INTO t_cash_transaction_type (identifier)
VALUES ('CASH_LOAD'),
       ('CASH_UNLOAD'),
       ('CASH_BUY'),
       ('CASH_SELL'),
       ('STOCK_BUY'),
       ('STOCK_SELL'),
       ('OPTION_BUY'),
       ('OPTION_SELL')
;

CREATE TABLE IF NOT EXISTS t_cash_transaction
(
    id                   UUID PRIMARY KEY                                             NOT NULL,
    timestamp            TIMESTAMP WITHOUT TIME ZONE                                  NOT NULL,
    broker               VARCHAR(256) REFERENCES t_broker (identifier)                NOT NULL,
    "user"               VARCHAR(256) REFERENCES t_user (identifier)                  NOT NULL,
    type                 VARCHAR(256) REFERENCES t_cash_transaction_type (identifier) NOT NULL,
    price                NUMERIC(20, 10)                                              NOT NULL,
    security_transaction UUID REFERENCES t_security_transaction (id)
);
