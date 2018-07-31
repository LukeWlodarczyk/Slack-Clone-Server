import { formatErrors } from '../helpers/formatErrors';
import { requiresAuth } from '../helpers/permissions';

export default {
	Mutation: {
		createTeam: requiresAuth.createResolver(
			async (parent, args, { models, user }) => {
				try {
					await models.Team.create({ ...args, owner: user.id });
					return {
						success: true,
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
};
