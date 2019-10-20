// Dependencies
let path = require('path');

// Routes

module.exports = function(app){

    //on the '/login' route we will use the 'GET' method to display the 'login' page
    app.get('/', function(req, res) {

        res.render('index');

    });

    //on the '/login' route we will use the 'GET' method to display the 'login' page
    app.get('/login', function(req, res){

        res.render('login');

    });

};