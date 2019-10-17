// Dependencies
let path = require('path');
var db = require("../models");
const Sequelize = require('sequelize');
const Op = Sequelize.Op
// Routes
module.exports = function (app) {

    async function createOrUpdatePantryIngredient(user_id, ingredientId, quantity, par) {
        const foundItem = await db.Pantry.findOne({ where: { user_id: user_id, ingredientId: ingredientId } });
        if (!foundItem) {
            // Item not found, create a new one
            var tempItem = {
                user_id: 1,
                quantity: parseInt(quantity),
                par: parseInt(par),
                IngredientId: parseInt(ingredientId)
            };
            console.log(tempItem);
            const item = await db.Pantry.create(tempItem).done(function(){});
            return item;
        } else {
            // Found an item, update it
            newQty = foundItem.quantity + parseInt(quantity);
            //const item = await db.Pantry.update(foundItem, { where: {user_id: user_id, ingredientId: ingredientId} });
            foundItem.update({quantity: newQty});
            return foundItem;
        }
    }

    app.get('/pantry', function (req, res) {

        hbsData = {};

        if (req.query.mode == 'add') {
            hbsData.addView = true;
            hbsData.editView = false;

        } else if (req.query.mode == 'edit') {
            hbsData.editView = true;
            hbsData.addView = false;

        };

        itemData = {
            item_name: "Maci's titties",
            measurement_unit: "nips"
        }

        res.render('view-pantry', hbsData);

    });

    app.get('/pantry-table', function (req, res) {

        res.render('partials/pantry-content-table', { layout: false });

    });

    app.get('/edit-pantry-table', function (req, res) {

        res.render('partials/edit-pantry-content-table', { layout: false })

    });

    app.get('/add-to-pantry-table', function (req, res) {

        res.render('partials/add-to-pantry-content-table', { layout: false })

    });

    app.post('/pantry', async function (req, res) {

        console.log(req.body);
        let ingredient_names = [];
        let ingredientIds = {};
        let toCreate = [];
        req.body.items.forEach(ingredient => {
            ingredient_names.push(ingredient.item_name);
        });

        //search to see if the ingredients already exist
        await db.Ingredient.findAll({
            where: {
                name: {
                    //SELECT * FROM INGREDIENTS WHERE NAME IN ('apples','oranges','olive oil')
                    [Op.or]: ingredient_names
                }
            }
        }).then(function (results) {
            //store the names and IDs of the ingredients we found in the database
            results.forEach(ingredient => {
                ingredientIds[ingredient.name] = ingredient.id;
            });
        });
        console.log(ingredientIds);
        //array of ingredient names we found
        let foundIngredients = Object.keys(ingredientIds);
        console.log(foundIngredients);

        req.body.items.forEach(ingredient => {
            if (foundIngredients.indexOf(ingredient.item_name) == -1) {
                toCreate.push({
                    name: ingredient.item_name,
                    measurement_unit: ingredient.measurement_unit
                });
            }
        });

        console.log(toCreate);

        // // create ingredients not existing
        await db.Ingredient.bulkCreate(toCreate).then(function (result) {
            result.forEach(ingredient => {
                console.log(ingredient.dataValues);
                ingredientIds[ingredient.name] = ingredient.id;
            });
        });

        req.body.items.forEach(ingredient => {
            let ingredientId = ingredientIds[ingredient.item_name];
            createOrUpdatePantryIngredient(1, ingredientId, ingredient.item_quantity, ingredient.item_par);
        });

        res.send()

    });

    app.post('/pantry-edit', function (req, res) {

        console.log(req.body);
        res.send()

    });

    app.delete('/pantry-item/:id', function (req, res) {

        console.log(req.params.id)
        res.send()

    });





}