// Requiring the dependencies
let express = require('express');

// Setting up the Express App
let app = express();
let PORT = process.env.PORT || 8080;

// Requiring our models for syncing
var db = require("./models");

// parse application body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static('public'));

// set handlebars
let exphbs = require("express-handlebars");
const HandleBars = require("handlebars")

app.engine("handlebars", exphbs({ defaultLayout: "main-layout" }));
app.set("view engine", "handlebars");

HandleBars.registerHelper('select', function(selected, options) {
  return options.fn(this).replace( new RegExp(' value=\"' + selected + '\"'), '$& selected="selected"').replace( new RegExp('>' + selected + '</option>','i'), ' selected="selected"$&');
});

// Import routes and give the server access to them.
require("./routes/html-routes.js")(app);
require("./routes/inventory-routes.js")(app);
require("./routes/recipes-routes.js")(app);



// Syncing our sequelize models and then starting our Express app
// =============================================================
db.sequelize.sync({ force: false }).then(function() {
  app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });
});
  