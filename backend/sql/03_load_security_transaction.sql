DELETE
FROM t_security_transaction;

-- CREATE TABLE IF NOT EXISTS t_security_transaction
-- (
--     id            UUID PRIMARY KEY                                                 NOT NULL,
--     timestamp     TIMESTAMP WITHOUT TIME ZONE                                      NOT NULL,
--     broker        d_short_text REFERENCES t_broker (identifier)                    NOT NULL,
--     "user"        d_short_text REFERENCES t_user (identifier)                      NOT NULL,
--     type          d_short_text REFERENCES t_security_transaction_type (identifier) NOT NULL,
--     amount        INTEGER                                                          NOT NULL,
--     price         d_money                                                          NOT NULL,
--     book_currency d_currency REFERENCES t_currency (identifier)                    NOT NULL,
--     book_fx_rate  d_money                                                          NOT NULL
-- );
INSERT INTO t_security_transaction (id, timestamp, broker, "user", type, amount, price, book_currency, book_fx_rate)
VALUES ()
;
