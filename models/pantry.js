/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	var Pantry = sequelize.define('Pantry', {
		user_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		quantity: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		par: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		}
	});

	return Pantry;
};
