DROP TABLE IF EXISTS pets;

CREATE TABLE pets (
    id SERIAL,
    name TEXT,
    kind TEXT,
    age INTEGER
);

INSERT INTO pets (name, kind, age) VALUES ('fido','Rainbow', 7 );
INSERT INTO pets (name, kind, age) VALUES ('Buttons','Snake', 5 );
INSERT INTO pets (name, kind, age) VALUES ('Mookie','dog', 4 );
INSERT INTO pets (name, kind, age) VALUES ('Cornflake','Parakeet', 3 );
