export default (sequelize, DataTypes) => {
	const Channel = sequelize.define('channel', {
		name: {
			type: DataTypes.STRING,
			validate: {
				len: {
					args: [3, 16],
					msg: 'The channel name needs to be between 3 and 16 characters long',
				},
			},
		},
		public: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
	});

	Channel.associate = models => {
		Channel.belongsTo(models.Team, {
			foreignKey: {
				name: 'teamId',
				field: 'team_id',
			},
		});

		Channel.belongsToMany(models.User, {
			through: 'channel_member',
			foreignKey: {
				name: 'channelId',
				field: 'channel_id',
			},
		});

		Channel.belongsToMany(models.User, {
			through: models.PCMember,
			foreignKey: {
				name: 'channelId',
				field: 'channel_id',
			},
		});
	};

	return Channel;
};
