# Perfect Pantry

## What is Perfect Pantry?

A mobile or desktop application used to monitor the on-hand inventory of your pantry and fridge items as well as compare recipes to your inventory and notify you if you don’t have enough ingredients. 

## How was it implemented?

Perfect Pantry has Four parts to it. Client side HTML using Handlebars & JavaScript. As well as server side JavaScript based on node & server side queries utilizing get, post, put and delete routes alonside sequelize to store and retreive information from the database. Using handlebars to dynamically render the information to our html. Handling authentication with Firebase Authentication services.

## Dependencies

Eat da Burger uses the following node packages as dependencies:

* [express](https://www.npmjs.com/package/express) - Used to start our server and listen for client requests
* [mysql](https://www.npmjs.com/package/mysql) - Used as our database
* [express-handlebars](https://www.npmjs.com/package/express-handlebars) - Used to keep dynamically render content from mysql
* [firebase](https://www.npmjs.com/package/firebase) - Used for authentication
* [firebaseui](https://www.npmjs.com/package/firebaseui) - Used for authentication interface
* [sequelize](https://www.npmjs.com/package/sequelize) - Used as a promise base orm for MySQL
* [path](https://www.npmjs.com/package/path) - Used as a path module
 

## Unpacking the App

The application is divided into six main parts

* config: holds two Javascript files   
    * connection.js - sets up the mysql connection
    * orm.js - what our models will use to communicate to the database

* routes: responsible for defining routes that the server can listen to there are three main js files for the routes
    * html-routes: handles both html GET routes to display the index and login pages
    * inventory-routes: handles 4 GET routes to render the information from the database, 2 POST routes to add information and update it in the database and 1 DELETE route to delete any items
    * recipes-routes: handles 5 GET routes to display recipe information, 3 PUT routes to handle the updating of the recipe table, 2 DELETE routes to remove recipes and ingredients, 1 POST route to update recipes

* db: mysql files
    * schema.sql - sets up the database 


* models: representation of the data we plan on sending to the database. Connects the database and server using sequelize

* public: contains the assets we will use on the client side such as CSS and Javascript

* views: contains the main.handlebars page we will use as a layout and the index.handlebars to render the burgers to the html dynamically

 
## Start to Finish:
Here's how you can use Eat da Burger!

1. First you will need to log-in using your Gmail
2. Once you log in you can navigate to either the Pantry or Recipes pages
3. When you navigate to the Pantry you can view the current items you have
4. Edit the items in your inventory 
5. Bulk add items using the input form. 
6. While in the Recipes view you can either view the recipes 
7. Edit them
8. If you edit a recipe it will allow you to input addition ingredients or edit the current ingredients 
9. If you view the recipe you can press the make recipe button and it will remove those items from your inventory or notify you if you don't have enough ingredients

Designed and developed by: Maci Slenes