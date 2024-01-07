DROP TABLE IF EXISTS entities;

CREATE TABLE entities (
    id INTEGER KEY UNIQUE,
    name TEXT,
    latitude REAL,
    longitude REAL,
    code TEXT,
    type TEXT,
    elevation REAL,
    info TEXT,
    site TEXT,
    severity INT
)