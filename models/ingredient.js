/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	var Ingredient=  sequelize.define('Ingredient', {
		name: {
			type: DataTypes.STRING(255),
			allowNull: false,
			unique: true
		},
		measurement_unit: {
			type: DataTypes.STRING(255),
			allowNull: false
		}
	});

	Ingredient.associate = function(models) {
		// We're saying that a Pantry entry should have an item
		Ingredient.hasMany(models.RecipeIngredient, {
		  onDelete: 'cascade'
		});
	
		Ingredient.hasMany(models.Pantry, {
			onDelete: 'cascade'
		  });
	  };

	return Ingredient;
};


