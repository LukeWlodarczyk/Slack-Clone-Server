import { formatErrors } from '../helpers/formatErrors';

export default {
	Mutation: {
		createTeam: async (parent, args, { models, user }) => {
			try {
				await models.Team.create({ ...args, owner: user.id });
				return {
					success: true,
				};
			} catch (err) {
				return {
					success: false,
					errors: formatErrors(err),
				};
			}
		},
	},
};
