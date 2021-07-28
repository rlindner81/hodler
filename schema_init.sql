DROP TABLE IF EXISTS t_broker;
DROP TABLE IF EXISTS t_currency;
DROP TABLE IF EXISTS t_cash_transaction;

CREATE TABLE IF NOT EXISTS t_currency
(
    identifier VARCHAR(3)   NOT NULL,
    name       VARCHAR(256) NOT NULL,
    PRIMARY KEY (identifier)
);
INSERT INTO t_currency (identifier, name)
VALUES ('EUR', 'Euro'),
       ('USD', 'US Dollar')
;

CREATE TABLE IF NOT EXISTS t_broker
(
    identifier VARCHAR(256) NOT NULL,
    name       VARCHAR(256) NOT NULL,
    PRIMARY KEY (identifier)
);
INSERT INTO t_broker (identifier, name)
VALUES ('DEGIRO', 'Degiro'),
       ('BANX', 'Banx Broker')
;

CREATE TABLE IF NOT EXISTS t_cash_transaction
(
    timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    broker    VARCHAR(256)                NOT NULL,
    purpose   VARCHAR(256)                NOT NULL,
    price     NUMERIC(12, 2)              NOT NULL,
    currency  VARCHAR(3)                  NOT NULL,
    security  VARCHAR(256),
    PRIMARY KEY (timestamp, broker, purpose),
    CONSTRAINT fk_broker FOREIGN KEY (broker) REFERENCES t_broker (identifier),
    CONSTRAINT fk_currency FOREIGN KEY (currency) REFERENCES t_currency (identifier)
);