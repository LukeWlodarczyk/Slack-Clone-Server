import { formatErrors } from '../helpers/formatErrors';
import { requiresAuth } from '../helpers/permissions';

export default {
	Mutation: {
		createChannel: requiresAuth.createResolver(
			async (parent, args, { models, user }) => {
				try {
					const team = await models.Team.findOne({
						where: { id: args.teamId },
					});

					if (team.owner !== user.id) {
						return {
							success: false,
							errors: [
								{
									path: 'name',
									message:
										'You cannot create channel in this team (You are not the team owner)',
								},
							],
						};
					}
					const channel = await models.Channel.create(args);

					return { success: true, channel };
				} catch (err) {
					return { success: false, errors: formatErrors(err, models) };
				}
			}
		),
	},
};
