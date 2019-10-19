// Dependencies
let path = require('path');
var db = require("../models");
const Sequelize = require('sequelize');
const Op = Sequelize.Op
// Routes
module.exports = function (app) {

    function authChecker(req,res){
        if(!req.query.uid){
            res.redirect('/login');
            return false;
        }
        else{
            return true;
        }
    }

    async function createOrUpdatePantryIngredient(user_id, ingredientId, quantity, par, measurement_unit, addQuantity) {
        const foundItem = await db.Pantry.findOne({ where: { user_id: user_id, ingredientId: ingredientId } });
        if (!foundItem) {
            // Item not found, create a new one
            var tempItem = {
                user_id: user_id,
                quantity: parseInt(quantity),
                par: parseInt(par),
                IngredientId: parseInt(ingredientId),
                measurement_unit: measurement_unit
            };
            console.log(tempItem);
            const item = await db.Pantry.create(tempItem).done(function(){});
            return item;
        } else {
            let newQty;
            // Found an item, update it
            if(addQuantity){
                newQty = foundItem.quantity + parseInt(quantity);
            }
            else{
                newQty = parseInt(quantity);
            }
            foundItem.update({quantity: newQty, par: parseInt(par), measurement_unit: measurement_unit});
            return foundItem;
        }
    }

    async function findUserPantryIngredients(user_id){
        const pantryEntries = await db.Pantry.findAll(
            { 
                where: {
                    user_id: user_id
                },
                include: [
                    {model: db.Ingredient}
                ]
            }
        );
        return pantryEntries;
    }

    app.get('/pantry', async function (req, res) {
        let authenticated = authChecker(req,res);
        if(!authenticated){
            return;
        }

        hbsData = {};

        if (req.query.mode == 'add') {
            hbsData.addView = true;
            hbsData.editView = false;

        } else{
            if (req.query.mode == 'edit') {
                hbsData.editView = true;
                hbsData.addView = false;
            };
            //read from the database and set it in the variable we'll be passing to the handlebar
            const pantryEntries = await db.Pantry.findAll(
                { 
                    where: {
                        user_id: req.query.uid
                    },
                    include: [
                        {model: db.Ingredient}
                    ]
                }
            );
            hbsData.pantryEntries = pantryEntries;
        }

        res.render('view-pantry', hbsData);

    });

    app.get('/pantry-table', async function (req, res) {
        hbsData = {
            layout: false
        };
        //read from the database and set it in the variable we'll be passing to the handlebar
        const pantryEntries = await db.Pantry.findAll(
            { 
                where: {
                    user_id: req.query.uid
                },
                include: [
                    {model: db.Ingredient}
                ]
            }
        );
        hbsData.pantryEntries = pantryEntries;
        
        res.render('partials/pantry-content-table', hbsData);

    });

    app.get('/edit-pantry-table', async function (req, res) {

        hbsData = {
            layout: false
        };
        //read from the database and set it in the variable we'll be passing to the handlebar
        hbsData.pantryEntries = await findUserPantryIngredients(req.query.uid);
        console.log(hbsData);
        
        res.render('partials/edit-pantry-content-table', hbsData);

    });

    app.get('/add-to-pantry-table', function (req, res) {

        res.render('partials/add-to-pantry-content-table', { layout: false })

    });

    app.post('/pantry', async function (req, res) {
        console.log("************");
        console.log(req.body.uid);
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
                    name: ingredient.item_name
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
            createOrUpdatePantryIngredient(req.body.uid, ingredientId, ingredient.item_quantity, ingredient.item_par, ingredient.measurement_unit, true);
        });

        res.send()

    });

    app.post('/pantry-edit', async function (req, res) {
        console.log(req.body);
        req.body.ingredients.forEach(ingredient => {
            newRows = createOrUpdatePantryIngredient(req.body.uid, parseInt(ingredient.item_id), ingredient.item_quantity, ingredient.item_par, ingredient.measurement_unit, false);
        });
        res.send();

    });

    app.delete('/pantry-item/:id', async function (req, res) {
        console.log("*************");
        console.log(req.query.uid);
        await db.Pantry.destroy(
            {
                where: {
                    user_id: req.query.uid,
                    IngredientId: parseInt(req.params.id)
                }
            }
        )
        res.send();

    });





}