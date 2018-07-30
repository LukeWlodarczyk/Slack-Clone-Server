export default (sequelize, DataTypes) => {
	const Message = sequelize.define('message', {
		text: {
			type: DataTypes.STRING,
		},
	});

	Message.associate = models => {
		Message.belongsTo(models.Channel, {
			foreignKey: 'owner',
		});
		Message.belongsTo(models.User, {
			foreignKey: 'userId',
		});
	};

	return Message;
};
