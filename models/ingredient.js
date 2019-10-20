module.exports = function(sequelize, DataTypes) {

	var Ingredient=  sequelize.define('Ingredient', {
		name: {
			type: DataTypes.STRING(255),
			allowNull: false,
			unique: true
		}
	});

	Ingredient.associate = function(models) {
		//Ingredient is related to RecipeIngredient using hasMany
		//each ingredient has many relationships with recipes
		Ingredient.hasMany(models.RecipeIngredient, {
		  onDelete: 'cascade'
		});
	
		//Ingredient is related to Pantry using hasMany
		//each ingredient has many relationships with pantries
		Ingredient.hasMany(models.Pantry, {
			onDelete: 'cascade'
		  });
	  };

	return Ingredient;
};


