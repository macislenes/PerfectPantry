module.exports = function(sequelize, DataTypes) {
	var RecipeIngredient = sequelize.define('RecipeIngredient', {
		quantity: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		measurement_unit: {
			type: DataTypes.STRING(255),
			allowNull: false
		}
	});

	
	  RecipeIngredient.associate = function(models) {
		//each recipeIngredient belongs to many recipes
		RecipeIngredient.belongsTo(models.Recipe);

		//each recipeIngredient belongs to many ingredients
		RecipeIngredient.belongsTo(models.Ingredient);
	  };

	return RecipeIngredient;
};
