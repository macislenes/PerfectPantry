/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	var RecipeIngredient = sequelize.define('RecipeIngredient', {
		quantity: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		}
	});

	return RecipeIngredient;
};
