// Dependencies
let path = require('path');
var db = require("../models");
const Sequelize = require('sequelize');
const Op = Sequelize.Op

// Routes
module.exports = function(app){

    async function createOrUpdateRecipeIngredient(recipeId, ingredientId, quantity, measurement_unit) {
        const foundItem = await db.RecipeIngredient.findOne({ where: { RecipeId: recipeId, IngredientId: ingredientId } });
        if (!foundItem) {
            // Item not found, create a new one
            var tempItem = {
                RecipeId: recipeId,
                quantity: parseInt(quantity),
                IngredientId: parseInt(ingredientId),
                measurement_unit: measurement_unit
            };

            const item = await db.RecipeIngredient.create(tempItem).done(function(){});
            return item;
        } else {
            foundItem.update({quantity: quantity, measurement_unit: measurement_unit});
            return foundItem;
        }
    }

    async function findRecipeIngredients(recipeId){
        const recipeIngredients = await db.RecipeIngredient.findAll(
            { 
                where: {
                    RecipeId: recipeId
                },
                include: [
                    {model: db.Ingredient}
                ]
            }
        );
        return recipeIngredients;
    }

    function authChecker(req,res){
        if(!req.query.uid){
            res.redirect('/login');
            return false;
        }
        else{
            return true;
        }
    }

    app.get('/recipes', async function(req, res) {
        let authenticated = authChecker(req,res);
        if(!authenticated){
            return;
        }
        hbsData = {}
        if(req.query.mode == 'add'){
            hbsData.addView = true;
        }
        else{
            hbsData.addView = false;
        }

        //read from the database and set it in the variable we'll be passing to the handlebar
        const recipeEntries = await db.Recipe.findAll(
            { 
                where: {
                    user_id: req.query.uid
                }
            }
        );
        hbsData.recipeEntries = recipeEntries;
        res.render('view-recipes', hbsData);

    });

    app.get('/recipes-view', async function(req, res) {
        hbsData = {layout: false};
        const recipeEntries = await db.Recipe.findAll(
            { 
                where: {
                    user_id: req.query.uid
                }
            }
        );
        hbsData.recipeEntries = recipeEntries;
        res.render('partials/recipes-content-table', hbsData);

    });

    app.get('/recipes-new', function(req, res) {

        res.render('partials/new-recipe-content-table', {layout: false})

    });

    app.get('/recipe-view/:id', async function(req, res) {

        console.log(req.params.id);
        const ingredients = await findRecipeIngredients(parseInt(req.params.id));
        let hbsData = {layout: false, ingredients: ingredients};
        const recipeEntry = await db.Recipe.findOne(
            { 
                where: {
                    id: parseInt(req.params.id)
                }
            }
        );
        hbsData.recipeEntry = recipeEntry;
        res.render('partials/recipe-modal-view-table', hbsData);

    });

    app.get('/recipe-edit/:id', async function(req, res) {
        console.log(req.params.id);
        const ingredients = await findRecipeIngredients(parseInt(req.params.id));
        let hbsData = {layout: false, ingredients: ingredients};
        const recipeEntry = await db.Recipe.findOne(
            { 
                where: {
                    id: parseInt(req.params.id)
                }
            }
        );
        hbsData.recipeEntry = recipeEntry;
        res.render('partials/recipe-modal-edit-table', hbsData);
    });

    app.put('/recipe-edit/:id', async function(req, res) {
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
                    name: ingredient.item_name
                });
            }
        });

        // // create ingredients not existing
        await db.Ingredient.bulkCreate(toCreate).then(function (result) {
            result.forEach(ingredient => {
                ingredientIds[ingredient.name] = ingredient.id;
            });
        });
        req.body.items.forEach(ingredient => {
            newRows = createOrUpdateRecipeIngredient(parseInt(req.body.recipe_id), ingredientIds[ingredient.item_name], ingredient.item_quantity, ingredient.measurement_unit)
        });
        res.send();

    });

    app.delete('/recipe/:recipeId/ingredient/:ingredientId', async function(req, res) {

        console.log(req.params.recipeId);
        console.log(req.params.ingredientId);
        await db.RecipeIngredient.destroy(
            {
                where: {
                    RecipeId: parseInt(req.params.recipeId),
                    IngredientId: parseInt(req.params.ingredientId)
                }
            }
        )
        res.send();

    });

    app.delete('/recipe/:recipeId', async function(req,res){
        console.log(req.params.recipeId);
        await db.Recipe.destroy(
            {
                where: {
                    id: parseInt(req.params.recipeId)
                }
            }
        )
        res.send();
    });

    app.put('/make-recipe/:recipeId', async function(req,res){
        console.log(req.params.recipeId);
        let ingredients = await findRecipeIngredients(req.params.recipeId);
        let ingredientIds = [];
        let inRecipe = {};
        ingredients.forEach(ingredient => {
            inRecipe[ingredient.IngredientId] = {name: ingredient.Ingredient.name, quantity: ingredient.quantity}
            ingredientIds.push(ingredient.IngredientId);
        });
        const pantryEntries = await db.Pantry.findAll(
            { 
                where: {
                    user_id: req.query.uid,
                    IngredientId: {
                        [Op.or]: ingredientIds
                    }
                },
                include: [
                    {model: db.Ingredient}
                ]
            }
        );
        let foundInPantry = {};
        pantryEntries.forEach(entry => {
            foundInPantry[entry.IngredientId] = {name: entry.Ingredient.name, quantity: entry.quantity}
        });
        console.log(inRecipe);
        console.log(foundInPantry);
        let needToPurchase = [];
        let available = [];
        Object.keys(inRecipe).forEach(ingredientId => {
            if(foundInPantry[ingredientId]){
                //found in pantry, check quantity
                if(inRecipe[ingredientId].quantity <= foundInPantry[ingredientId].quantity){
                    //have enough
                    available.push(inRecipe[ingredientId]);
                }else{
                    //don't have enough, need to purchase
                    needToPurchase.push({
                        name: inRecipe[ingredientId].name,
                        need: inRecipe[ingredientId].quantity,
                        have: foundInPantry[ingredientId].quantity
                    });
                }
            }else{
                //not in pantry, out of stock
                needToPurchase.push({
                    name: inRecipe[ingredientId].name,
                    need: inRecipe[ingredientId].quantity,
                    have: 0
                });
            }
        });
        console.log(needToPurchase);
        console.log(available);

        if(needToPurchase.length == 0){
            //we can reduce the quantities now and confirm the recipe was made
            pantryEntries.forEach(entry => {
                let newQty = entry.quantity - inRecipe[entry.IngredientId].quantity;
                if(newQty > 0){
                    entry.update({
                        quantity: newQty
                    });
                }else{
                    entry.destroy();
                }
            });
            res.json(
                {
                    success: true
                }
            );
        }
        else{
            //respond with insufficient quantity message
            res.json({
                success: false,
                needToPurchase: needToPurchase
            });
        }
    });


    app.post('/recipe', async function(req, res) {
        console.log(req.body);
        let ingredient_names = [];
        let ingredientIds = {};
        let toCreate = [];
        req.body.ingredients.forEach(ingredient => {
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

        req.body.ingredients.forEach(ingredient => {
            if (foundIngredients.indexOf(ingredient.item_name) == -1) {
                toCreate.push({
                    name: ingredient.item_name
                });
            }
        });

        // // create ingredients not existing
        await db.Ingredient.bulkCreate(toCreate).then(function (result) {
            result.forEach(ingredient => {
                ingredientIds[ingredient.name] = ingredient.id;
            });
        });

        //Create recipe
        let createdRecipeId;
        await db.Recipe.create({name: req.body.recipe_name, user_id: req.body.uid}).then(function(result){
            createdRecipeId = result.id;
        });

        req.body.ingredients.forEach(ingredient => {
            let ingredientId = ingredientIds[ingredient.item_name];
            createOrUpdateRecipeIngredient(createdRecipeId, ingredientId, ingredient.item_quantity, ingredient.measurement_unit);
        });

        console.log(toCreate);
        res.send();

    });

    



}