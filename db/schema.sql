### SCHEMA

DROP DATABASE IF EXISTS perfect_pantry_db;
CREATE DATABASE perfect_pantry_db;
USE perfect_pantry_db;

CREATE TABLE items 
(
    item_id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    item_name varchar (255) NOT NULL

);

CREATE TABLE pantries
(

    user_id int NOT NULL,
    item_id int NOT NULL,
    item_quantity int NOT NULL,
    measurement_unit varchar (255) NOT NULL,
    item_par int NOT NULL,
    PRIMARY KEY (user_id, item_id),
    CONSTRAINT fk_item
    FOREIGN KEY (item_id)
        REFERENCES items(item_id)
        ON DELETE CASCADE

);

CREATE TABLE recipes
(

    recipe_id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id int NOT NULL,
    recipe_name varchar (255) NOT NULL
    

);

CREATE TABLE recipe_ingredients
(

    recipe_id int NOT NULL,
    item_id int NOT NULL,
    item_quantity int NOT NULL,
    measurement_unit varchar (255) NOT NULL,
    PRIMARY KEY (recipe_id, item_id),
    CONSTRAINT fk_recipes
    FOREIGN KEY (recipe_id)
        REFERENCES recipes(recipe_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_recipe_items
    FOREIGN KEY (item_id)
        REFERENCES items(item_id)
        ON DELETE CASCADE

)