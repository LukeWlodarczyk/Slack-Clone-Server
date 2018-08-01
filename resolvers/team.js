import { formatErrors } from '../helpers/formatErrors';
import { requiresAuth } from '../helpers/permissions';

export default {
	Query: {
		allTeams: requiresAuth.createResolver(
			async (parent, args, { models, user }) => {
				return await models.Team.findAll({
					where: {
						owner: user.id,
					},
				});
			}
		),
	},
	Mutation: {
		createTeam: requiresAuth.createResolver(
			async (parent, args, { models, user }) => {
				try {
					const team = await models.Team.create({ ...args, owner: user.id });
					await models.Channel.create({
						name: 'general',
						public: true,
						teamId: team.id,
					});
					return {
						success: true,
						team,
					};
				} catch (err) {
					return {
						success: false,
						errors: formatErrors(err, models),
					};
				}
			}
		),
	},
	Team: {
		channels: ({ id }, args, { models }) =>
			models.Channel.findAll({
				where: {
					teamId: id,
				},
			}),
	},
};
