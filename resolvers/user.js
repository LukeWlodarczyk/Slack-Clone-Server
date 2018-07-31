import _ from 'lodash';

const formatErrors = (e, models) => {
	if (e instanceof models.sequelize.ValidationError) {
		//  _.pick({a: 1, b: 2}, 'a') => {a: 1}
		return e.errors.map(x => _.pick(x, ['path', 'message']));
	}

	return [{ path: 'ServerError', message: 'Something went wrong' }];
};

export default {
	Query: {
		getUser: async (parent, { id }, { models }) =>
			models.User.findOne({ where: { id } }),
		allUsers: async (parent, args, { models }) => models.User.findAll(),
	},
	Mutation: {
		register: async (parent, args, { models }) => {
			try {
				const user = await models.User.create(args);
				return {
					success: true,
					user,
				};
			} catch (err) {
				return {
					success: false,
					errors: formatErrors(err, models),
				};
			}
		},
	},
};
