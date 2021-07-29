DELETE
FROM t_security;

-- CREATE TABLE IF NOT EXISTS t_security
-- (
--     identifier d_short_text PRIMARY KEY                             NOT NULL,
--     isin       d_short_text,
--     currency   d_currency REFERENCES t_currency (identifier)        NOT NULL,
--     type       d_short_text REFERENCES t_security_type (identifier) NOT NULL,
--     underlying d_short_text REFERENCES t_security (identifier)      NOT NULL
-- );
INSERT INTO t_security (identifier, currency, type, underlying)
VALUES ('ABNB', 'USD', 'STOCK', 'ABNB'),
       ('AMD', 'USD', 'STOCK', 'AMD'),
       ('AMD220121C00077500', 'USD', 'OPTION', 'AMD'),
       ('BABA', 'USD', 'STOCK', 'BABA'),
       ('BARK', 'USD', 'STOCK', 'BARK'),
       ('BARK210820C00025000', 'USD', 'OPTION', 'BARK'),
       ('BOWX', 'USD', 'STOCK', 'BOWX'),
       ('BUD', 'USD', 'STOCK', 'BUD'),
       ('LCID', 'USD', 'STOCK', 'LCID'),
       ('CCL', 'USD', 'STOCK', 'CCL'),
       ('CCL220121C00012500', 'USD', 'OPTION', 'CCL'),
       ('CRSR', 'USD', 'STOCK', 'CRSR'),
       ('DIS', 'USD', 'STOCK', 'DIS'),
       ('DOOR', 'USD', 'STOCK', 'DOOR'),
       ('FB', 'USD', 'STOCK', 'FB'),
       ('FRA:2B76', 'EUR', 'STOCK', 'FRA:2B76'),
       ('FRA:2B77', 'EUR', 'STOCK', 'FRA:2B77'),
       ('FRA:2B78', 'EUR', 'STOCK', 'FRA:2B78'),
       ('FRA:2B79', 'EUR', 'STOCK', 'FRA:2B79'),
       ('FRA:7CD', 'EUR', 'STOCK', 'FRA:7CD'),
       ('FRA:AIR', 'EUR', 'STOCK', 'FRA:AIR'),
       ('FRA:IQQV', 'EUR', 'STOCK', 'FRA:IQQV'),
       ('FRA:ISPA', 'EUR', 'STOCK', 'FRA:ISPA'),
       ('FRA:SIX2', 'EUR', 'STOCK', 'FRA:SIX2'),
       ('FRA:WDI', 'EUR', 'STOCK', 'FRA:WDI'),
       ('GRWG', 'USD', 'STOCK', 'GRWG'),
       ('IRBT', 'USD', 'STOCK', 'IRBT'),
       ('MNMD', 'USD', 'STOCK', 'MNMD'),
       ('MNMD220121C00005000', 'USD', 'OPTION', 'MNMD'),
       ('MSFT', 'USD', 'STOCK', 'MSFT'),
       ('PLTR', 'USD', 'STOCK', 'PLTR'),
       ('PTON', 'USD', 'STOCK', 'PTON'),
       ('SONO', 'USD', 'STOCK', 'SONO'),
       ('STOR', 'USD', 'STOCK', 'STOR'),
       ('TWTR', 'USD', 'STOCK', 'TWTR'),
       ('TTCF', 'USD', 'STOCK', 'TTCF'),
       ('UNVR', 'USD', 'STOCK', 'UNVR')
;
