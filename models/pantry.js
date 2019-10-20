module.exports = function(sequelize, DataTypes) {
	var Pantry = sequelize.define('Pantry', {
		user_id: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		quantity: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		par: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		measurement_unit: {
			type: DataTypes.STRING(255),
			allowNull: false
		}
	});

	Pantry.associate = function(models) {
		//each pantry is related to the Ingredient using belongsTo
		//the pantry entry belongs to an Ingredient
		Pantry.belongsTo(models.Ingredient);

	  };

	return Pantry;
};
