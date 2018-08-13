import bcrypt from 'bcrypt';

export default (sequelize, DataTypes) => {
	const User = sequelize.define(
		'user',
		{
			username: {
				type: DataTypes.STRING,
				unique: {
					args: true,
					msg: 'Username already in use',
				},
				validate: {
					isAlphanumeric: {
						args: true,
						msg: 'The username can only contains letters and numbers',
					},
					len: {
						args: [3, 25],
						msg: 'The username needs to be between 3 and 25 characters long',
					},
				},
			},
			email: {
				type: DataTypes.STRING,
				unique: {
					args: true,
					msg: 'Email address already in use',
				},
				validate: {
					isEmail: {
						args: true,
						msg: 'Invalid email',
					},
				},
			},
			password: {
				type: DataTypes.STRING,
				validate: {
					len: {
						args: [6, 25],
						msg: 'The password needs to be between 6 and 25 characters long',
					},
				},
			},
		},
		{
			hooks: {
				afterValidate: async user => {
					const hashedPassword = await bcrypt.hash(user.password, 10);
					user.password = hashedPassword;
				},
			},
		}
	);

	User.associate = models => {
		User.belongsToMany(models.Team, {
			through: models.Member,
			foreignKey: {
				name: 'userId',
				field: 'user_id',
			},
		});

		User.belongsToMany(models.Channel, {
			through: 'channel_member',
			foreignKey: {
				name: 'userId',
				field: 'user_id',
			},
		});

		User.belongsToMany(models.Channel, {
			through: models.PCMember,
			foreignKey: {
				name: 'userId',
				field: 'user_id',
			},
		});
	};

	return User;
};
