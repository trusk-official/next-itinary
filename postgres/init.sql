CREATE DATABASE itinerary;
\connect itinerary;
CREATE TABLE itineraries (
    id  SERIAL PRIMARY KEY,
    label            TEXT,
    place_ids  TEXT[]
);

INSERT INTO itineraries (label, place_ids)
    VALUES ('Itinéraire 1',
    '{"ChIJ7Ysfe3Ju5kcRkEqBmH8U1gA", "ChIJOwLjjv1x5kcR7Su2S5JKt-s", "ChIJWUzyCP5x5kcRAdDR77pS4-E", "ChIJsxSBmjVu5kcRB5zbauaDoJ0"}');