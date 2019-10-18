/* jshint indent: 1 */

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
		RecipeIngredient.belongsTo(models.Recipe);
		RecipeIngredient.belongsTo(models.Ingredient);
	  };

	return RecipeIngredient;
};
