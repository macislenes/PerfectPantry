module.exports = function(sequelize, DataTypes) {
	var Recipe = sequelize.define('Recipe', {
		user_id: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false
		}
	});

	Recipe.associate = function(models) {
		
		//every recipe hasMany recipeIngredients
		Recipe.hasMany(models.RecipeIngredient, {
		  onDelete: 'cascade'
		});
	
	  };

	return Recipe;
};