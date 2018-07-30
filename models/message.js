export default (sequelize, DataTypes) => {
	const Message = sequelize.define(
		'message',
		{
			text: {
				type: DataTypes.STRING,
			},
		},
		{
			underscored: true,
		}
	);

	Message.associate = models => {
		Message.belongsTo(models.Channel, {
			foreignKey: 'owner',
		});
		Message.belongsTo(models.User, {
			foreignKey: {
				name: 'userId',
				field: 'user_id',
			},
		});
	};

	return Message;
};
