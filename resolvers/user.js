import bcrypt from 'bcrypt';

export default {
	Query: {
		getUser: async (parent, { id }, { models }) =>
			models.User.findOne({ where: { id } }),
		allUsers: async (parent, args, { models }) => models.User.findAll(),
	},
	Mutation: {
		register: async (parent, { password, ...args }, { models }) => {
			try {
				const hash = await bcrypt.hash(password, 10);
				await models.User.create({ ...args, password: hash });
				return true;
			} catch (e) {
				return false;
			}
		},
	},
};
