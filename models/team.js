export default (sequelize, DataTypes) => {
	const Team = sequelize.define('team', {
		name: {
			type: DataTypes.STRING,
			unique: {
				args: true,
				msg: 'Team name is already in use',
			},
			validate: {
				len: {
					args: [3, 16],
					msg: 'The team name needs to be between 3 and 16 characters long',
				},
			},
		},
	});

	Team.associate = models => {
		Team.belongsToMany(models.User, {
			through: models.Member,
			foreignKey: {
				name: 'teamId',
				field: 'team_id',
			},
		});
		Team.belongsTo(models.User, {
			foreignKey: 'owner',
		});
	};

	return Team;
};
