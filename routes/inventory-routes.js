// Dependencies
let path = require('path');
var db = require("../models");
const Sequelize = require('sequelize');
const Op = Sequelize.Op

// Routes
module.exports = function (app) {

    // checking to see if our user is logged in
    function authChecker(req,res){
        // if there is not a uid in the request 
        if(!req.query.uid){
            //redirect them to the 'login' page
            res.redirect('/login');
            return false;
        }
        // else return true and continue on
        else{
            return true;
        }
    }

    //function used to update or create ingredients
    async function createOrUpdatePantryIngredient(user_id, ingredientId, quantity, par, measurement_unit, addQuantity) {
        //checking if there is another ingredient present in the table where the user-id and ingredient_id match
        const foundItem = await db.Pantry.findOne({ where: { user_id: user_id, ingredientId: ingredientId } });
        //If the item is not found, create a new one
        //store it in a temporary string before pushing it to the db
        if (!foundItem) {
            var tempItem = {
                user_id: user_id,
                quantity: parseInt(quantity),
                par: parseInt(par),
                IngredientId: parseInt(ingredientId),
                measurement_unit: measurement_unit
            };
            console.log(tempItem);
            //we will create a new item in the pantry with the information above
            const item = await db.Pantry.create(tempItem).done(function(){});
            return item;
        } else {
            let newQty;
            // Found an item, update it's current quantity
            // we will add the new value to the current value
            if(addQuantity){
                newQty = foundItem.quantity + parseInt(quantity);
            }
            // else we display the new quantity
            else{
                newQty = parseInt(quantity);
            }
            //update the foundItem array with the new quantities
            foundItem.update({quantity: newQty, par: parseInt(par), measurement_unit: measurement_unit});
            return foundItem;
        }
    }

    //function to retrieve all the pantry entires for the user
    //where the user id matches
    //we will include the information from the ingredients table for each pantry entry
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

    //'get' route on our '/pantry'
    app.get('/pantry', async function (req, res) {
        //checking if our user has logged in
        let authenticated = authChecker(req,res);
        //if they are not we will take them to the home page
        if(!authenticated){
            return;
        }

        //object used to store the information returned from handlebars
        hbsData = {};

        //if our query mode is add we will change the view
        if (req.query.mode == 'add') {
            hbsData.addView = true;
            hbsData.editView = false;

        } else{
            //when the query mode is 'edit'
            if (req.query.mode == 'edit') {
                hbsData.editView = true;
                hbsData.addView = false;
            };
            //if the view is edit we will look at the database and find all the pantryEntries where there user id matches
            //we will include the information from the ingredients table for each pantry entry
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
            //hbsData now contains the pantry entries from the db
            hbsData.pantryEntries = pantryEntries;
        }

        //render the view pantry page containing the users pantry information
        res.render('view-pantry', hbsData);

    });

    //using the 'get' route on the '/pantry-table' 
    app.get('/pantry-table', async function (req, res) {
        // layout set to false so we remove any styling
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
        // the hbsData contains each pantry entry
        hbsData.pantryEntries = pantryEntries;
        
        // render the pantry entries to the pantry content table
        res.render('partials/pantry-content-table', hbsData);

    });

    //using the 'get' route on the '/edit-pantry-table' route
    app.get('/edit-pantry-table', async function (req, res) {
        //removing the styling from the data
        hbsData = {
            layout: false
        };
        // read from the database and set it in the variable we'll be passing to the handlebar
        // using the 'findUserPantryIngredients' to pass the user id through
        hbsData.pantryEntries = await findUserPantryIngredients(req.query.uid);
        console.log(hbsData);

        //render the edit pantry view containing the users pantry items in a form
        res.render('partials/edit-pantry-content-table', hbsData);

    });

    //using the 'get' route on  '/add-to-pantry-table
    app.get('/add-to-pantry-table', function (req, res) {

        //render the table without the layout
        res.render('partials/add-to-pantry-content-table', { layout: false })

    });

    //'post' route to the pantry 
   app.post('/pantry', async function (req, res) {
        console.log("************");
        console.log(req.body.uid);

        //stroing the ingredient details 
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

        console.log(toCreate);

        // create ingredients not existing
        await db.Ingredient.bulkCreate(toCreate).then(function (result) {
            result.forEach(ingredient => {
                console.log(ingredient.dataValues);
                ingredientIds[ingredient.name] = ingredient.id;
            });
        });

        //for each ingredient we will run the createOrUpdatePantryIngredient function passing in our new values
        req.body.items.forEach(ingredient => {
            let ingredientId = ingredientIds[ingredient.item_name];
            createOrUpdatePantryIngredient(req.body.uid, ingredientId, ingredient.item_quantity, ingredient.item_par, ingredient.measurement_unit, true);
        });

        res.send()

    });

    // 'post' route to /pantry-edit' to update everything on submit
    app.post('/pantry-edit', async function (req, res) {
        console.log(req.body);
        req.body.ingredients.forEach(ingredient => {
            newRows = createOrUpdatePantryIngredient(req.body.uid, parseInt(ingredient.item_id), ingredient.item_quantity, ingredient.item_par, ingredient.measurement_unit, false);
        });
        res.send();

    });

    //'delete' route using destroy to remove the pantry item from the inventory
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