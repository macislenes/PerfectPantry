// Dependencies
let path = require('path');

// Routes

module.exports = function(app){

    app.get('/', function(req, res) {

        hbsData = {};

        if(req.query.mode == 'home'){

            hbsData.homeView = true;

        }else {

            hbsData.homeView = false;

        };

        res.render('index');

    });

    app.get('/login', function(req, res){
        res.render('login');
    });




}