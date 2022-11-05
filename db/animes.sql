CREATE DATABASE animes;
use animes;

CREATE TABLE animesStored(
    id INT NOT NULL AUTO_INCREMENT,
    animeObject JSON NOT NULL,
    PRIMARY KEY (id)
);

create table popularAnimes(
    id INT NOT NULL AUTO_INCREMENT,
    animeObject JSON NOT NULL,
    PRIMARY KEY (id)
);