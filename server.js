// Requiring the dependencies
let express = require('express');

// Setting up the Express App
let app = express();
let PORT = process.env.PORT || 8080;

// parse application body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static('public'));

// set handlebars
let exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main-layout" }));
app.set("view engine", "handlebars");

// Import routes and give the server access to them.
require("./routes/html-routes.js")(app);
require("./routes/inventory-routes.js")(app);
//require("./routes/recipes-routes.js")(app);


//db.sequelize.sync({ force: true }).then(function() {
    app.listen(PORT, function() {
      console.log("App listening on PORT " + PORT);
    });
//  });
  