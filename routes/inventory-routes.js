// Dependencies
let path = require('path');

// Routes

module.exports = function(app){

    app.get('/pantry', function(req, res) {

        res.render('view-pantry');

    });

    app.get('/pantry-table', function(req, res) {

        res.render('partials/pantry-content-table', {layout: false});

    });

    app.get('/edit-pantry-table', function(req, res) {

        res.render('partials/edit-pantry-content-table', {layout: false})

    });

    app.get('/add-to-pantry-table', function(req, res) {

        res.render('partials/add-to-pantry-content-table', {layout: false})

    });

    app.get('/recipes', function(req, res) {

        res.render('view-recipes')

    });

    app.get('/recipes-new, function(req, res) {

        res.render('partial/')

    })



}