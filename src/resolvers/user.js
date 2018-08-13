import { tryLogin } from '../helpers/auth';
import { formatErrors } from '../helpers/formatErrors';
import { requiresAuth } from '../helpers/permissions';

export default {
	User: {
		teams: async ({ id }, args, { models, user }) =>
			await models.sequelize.query(
				'select * from teams as team join members as member on team.id = member.team_id where member.user_id = ?',
				{
					replacements: [user.id],
					model: models.Team,
					raw: true,
				}
			),
	},
	Query: {
		allUsers: async (parent, args, { models }) => models.User.findAll(),
		getAuthUser: requiresAuth.createResolver(
			async (parent, args, { models, user }) =>
				models.User.findOne({ where: { id: user.id } })
		),
		getUserById: async (parent, { userId }, { models, user }) =>
			models.User.findOne({ where: { id: userId } }),
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
