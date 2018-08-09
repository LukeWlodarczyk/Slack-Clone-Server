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

					const response = await models.sequelize.transaction(
						async transaction => {
							const channel = await models.Channel.create(args, {
								transaction,
							});
							if (!args.public) {
								const privateMembers = args.privateMembers.filter(
									m => m !== user.id
								);

								privateMembers.push(user.id);

								const pcmembers = privateMembers.map(m => ({
									userId: m,
									channelId: channel.dataValues.id,
								}));

								await models.PCMember.bulkCreate(pcmembers, { transaction });
							}
							return channel;
						}
					);

					return { success: true, channel: response };
				} catch (err) {
					console.log(err);
					return { success: false, errors: formatErrors(err, models) };
				}
			}
		),
	},
};
