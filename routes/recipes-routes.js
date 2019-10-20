// Dependencies
let path = require('path');
var db = require("../models");
const Sequelize = require('sequelize');
const Op = Sequelize.Op

// Routes
module.exports = function(app){

    // function to create or update recipe ingredients
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
    //function to retrieve all the recipe ingredients for the user
    //where the user id matches
    //we will include the information from the ingredients table for each recipe ingredient
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

    //checking to see if our using is logged in
    //if not it will route them to the login page
    function authChecker(req,res){
        if(!req.query.uid){
            res.redirect('/login');
            return false;
        }
        else{
            return true;
        }
    }

    //'get' route on our '/recipes' 
    app.get('/recipes', async function(req, res) {
        //checking if our user has logged in
        let authenticated = authChecker(req,res);
        //if they are not we will take them to the home page
        if(!authenticated){
            return;
        }

        //object used to store the information returned from handlebars
        hbsData = {}

        //if our query mode is add we will change the view
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
        //render the view recipes page containing the users recipe information
        res.render('view-recipes', hbsData);

    });

    //using the 'get' route on the '/pantry-table' 
    app.get('/recipes-view', async function(req, res) {
        // layout set to false so we remove any styling
        hbsData = {layout: false};
        //read from the database and set it in the variable we'll be passing to the handlebar
        const recipeEntries = await db.Recipe.findAll(
            { 
                where: {
                    user_id: req.query.uid
                }
            }
        );
        // the hbsData contains each recipe entry
        hbsData.recipeEntries = recipeEntries;

        // render the recipe entries to the recipe content table
        res.render('partials/recipes-content-table', hbsData);

    });

    //using the 'get' route on the '/recipes-new' route
    app.get('/recipes-new', function(req, res) {

        //render the table without the layout
        res.render('partials/new-recipe-content-table', {layout: false})

    });


    //using the 'get' route on  '/recipe-view/:id'
    app.get('/recipe-view/:id', async function(req, res) {

        console.log(req.params.id);
        //retrieving the recipe id 
        const ingredients = await findRecipeIngredients(parseInt(req.params.id));
        let hbsData = {layout: false, ingredients: ingredients};
        //we will find each recipe entry where the id matches
        const recipeEntry = await db.Recipe.findOne(
            { 
                where: {
                    id: parseInt(req.params.id)
                }
            }
        );
        //setting the information we are going to send handlebars
        hbsData.recipeEntry = recipeEntry;
        //render the table with the hbsData
        res.render('partials/recipe-modal-view-table', hbsData);

    });

    //using the 'get' route on the '/recipe-edit/:id' route
    app.get('/recipe-edit/:id', async function(req, res) {
        console.log(req.params.id);
        //running the findRecipeIngredients function on the recipe id
        const ingredients = await findRecipeIngredients(parseInt(req.params.id));

        // setting up our hbsData
        let hbsData = {layout: false, ingredients: ingredients};
        const recipeEntry = await db.Recipe.findOne(
            { 
                where: {
                    id: parseInt(req.params.id)
                }
            }
        );
        //setting the information we are going to send handlebars
        hbsData.recipeEntry = recipeEntry;

        //render the table using the recipe information we got from the db
        res.render('partials/recipe-modal-edit-table', hbsData);
    });

    //using 'put' route on '/recipe-edit/:id' 
    app.put('/recipe-edit/:id', async function(req, res) {
        console.log(req.body);

        //storing the ingredient details 
        let ingredient_names = [];
        let ingredientIds = {};
        let toCreate = [];
        req.body.items.forEach(ingredient => {
            // pushing each ingredients name into the ingredients array
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

        //if each ingredient is not present we push the name into toCreate array
        req.body.items.forEach(ingredient => {
            if (foundIngredients.indexOf(ingredient.item_name) == -1) {
                toCreate.push({
                    name: ingredient.item_name
                });
            }
        });

        // create ingredients not existing
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

    //'delete' route using destroy to remove the ingredient from the recipe
    app.delete('/recipe/:recipeId/ingredient/:ingredientId', async function(req, res) {

        console.log(req.params.recipeId);
        console.log(req.params.ingredientId);
        // destroy the record of the ingredient where where the recipeId and ingredientId match
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

    //'delete' route using destroy to remove the recipe from the db
    app.delete('/recipe/:recipeId', async function(req,res){
        console.log(req.params.recipeId);
        // destroy the record of the ingredient where where the recipeId match
        await db.Recipe.destroy(
            {
                where: {
                    id: parseInt(req.params.recipeId)
                }
            }
        )
        res.send();
    });

    // 'put' route run on /make-recipe/:recipeId
    app.put('/make-recipe/:recipeId', async function(req,res){
        console.log(req.params.recipeId);

        //storing the ingredients
        let ingredients = await findRecipeIngredients(req.params.recipeId);
        let ingredientIds = [];
        let inRecipe = {};
        // for each ingredient push the ingredient id into the array
        ingredients.forEach(ingredient => {
            inRecipe[ingredient.IngredientId] = {name: ingredient.Ingredient.name, quantity: ingredient.quantity}
            ingredientIds.push(ingredient.IngredientId);
        });
        // find all items in our pantry where id and ingredient id match
        // include each ingredients information from our Ingredient table
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
        // used to store the items we find in our pantry
        let foundInPantry = {};
        // for wah of those entries we store their name and quantity
        pantryEntries.forEach(entry => {
            foundInPantry[entry.IngredientId] = {name: entry.Ingredient.name, quantity: entry.quantity}
        });
        console.log(inRecipe);
        console.log(foundInPantry);
        // empty arrays to store compared items 
        let needToPurchase = [];
        let available = [];
        //in recipes for each ingredient id 
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

        //if the need to purchase array contains nothing we remove the recipe quantities from the current on-hand inventory
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

    //using a 'post' route on '/recipe'
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

        // for each item not found we push them to 'toCreate'
        req.body.ingredients.forEach(ingredient => {
            if (foundIngredients.indexOf(ingredient.item_name) == -1) {
                toCreate.push({
                    name: ingredient.item_name
                });
            }
        });

        // create ingredients not existing
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

        //for each ingredient in the body use the createOrUpdateRecipeIngredient passing the new information through
        req.body.ingredients.forEach(ingredient => {
            let ingredientId = ingredientIds[ingredient.item_name];
            createOrUpdateRecipeIngredient(createdRecipeId, ingredientId, ingredient.item_quantity, ingredient.measurement_unit);
        });

        console.log(toCreate);
        res.send();

    });

    



}