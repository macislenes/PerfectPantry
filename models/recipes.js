/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	var Recipe = sequelize.define('Recipe', {
		user_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false
		}
	});

	Recipe.associate = function(models) {
		// We're saying that a Pantry entry should have an item
		Recipe.hasMany(models.RecipeIngredient, {
		  onDelete: 'cascade'
		});
	
	  };

	return Recipe;
};