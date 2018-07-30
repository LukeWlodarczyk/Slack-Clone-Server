export default {
	Query: {
		getUser: async (parent, { id }, { models }) =>
			models.User.findOne({ where: { id } }),
		allUsers: async (parent, args, { models }) => models.User.findAll(),
	},
	Mutation: {
		createUser: async (parent, args, { models }) => models.User.create(args),
	},
};
