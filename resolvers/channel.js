import { formatErrors } from '../helpers/formatErrors';
import { requiresAuth } from '../helpers/permissions';

export default {
	Mutation: {
		createChannel: requiresAuth.createResolver(
			async (parent, args, { models, user }) => {
				try {
					const member = await models.Member.findOne({
						where: { teamId: args.teamId, userId: user.id },
					});

					if (!member.admin) {
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
