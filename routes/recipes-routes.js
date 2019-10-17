// Dependencies
let path = require('path');

// Routes
module.exports = function(app){

    app.get('/recipes', function(req, res) {

        hbsData = {}
        if(req.query.mode == 'add'){
            hbsData.addView = true;
        }
        else{
            hbsData.addView = false;
        }
        res.render('view-recipes', hbsData);

    });

    app.get('/recipes-view', function(req, res) {

        res.render('partials/recipes-content-table', {layout: false})

    });

    app.get('/recipes-new', function(req, res) {

        res.render('partials/new-recipe-content-table', {layout: false})

    });

    app.get('/recipe-view/:id', function(req, res) {

        console.log(req.params.id);
        res.render('partials/recipe-modal-view-table', {layout: false})

    });

    app.get('/recipe-edit/:id', function(req, res) {

        console.log(req.params.id);
        res.render('partials/recipe-modal-edit-table', {layout: false})

    });

    app.put('/recipe-edit/:id', function(req, res) {

        console.log(req.body);
        res.send()

    });

    app.delete('/recipe-edit/:id', function(req, res) {

        console.log(req.params.id);
        res.send()

    });


    app.post('/recipe', function(req, res) {

        console.log(req.body);
        res.send();

    });

    



}