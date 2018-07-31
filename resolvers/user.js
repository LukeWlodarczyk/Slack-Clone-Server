import { tryLogin } from '../helpers/auth';
import { formatErrors } from '../helpers/formatErrors';

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
		login: (parent, { email, password }, { models, secret, refreshSecret }) =>
			tryLogin(email, password, models, secret, refreshSecret),
	},
};
