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
					return { success: false, errors: formatErrors(err, models) };
				}
			}
		),
		getOrCreateChannel: requiresAuth.createResolver(
			async (parent, { dmMembers, teamId }, { models, user }) => {
				try {
					const member = await models.Member.findOne({
						where: { teamId, userId: user.id },
					});

					if (!member) {
						throw new Error('Not Authorized');
					}

					const allDMMembers = [...dmMembers, user.id];

					const [data, result] = await models.sequelize.query(
						`select c.id, c.name, c.dm from channels as c, pcmembers pc where pc.channel_id = c.id and c.dm = true and c.public = false and c.team_id = ${teamId} group by c.id having array_agg(pc.user_id) @> Array[${allDMMembers.join(
							','
						)}] and count(pc.user_id) = ${allDMMembers.length};`,
						{ raw: true }
					);

					if (data.length) {
						return {
							success: false,
							channel: data[0],
							errors: [
								{
									path: 'channel',
									message: 'Conversation with that members already exists',
								},
							],
						};
					}

					const users = await models.User.findAll({
						where: {
							id: {
								[models.sequelize.Op.in]: allDMMembers,
							},
						},
					});

					const name = users.map(u => u.username).join(', ');

					const channel = await models.sequelize.transaction(
						async transaction => {
							const channel = await models.Channel.create(
								{ name, public: false, dm: true, teamId },
								{
									transaction,
								}
							);

							const dmMembersToCreate = allDMMembers.map(m => ({
								userId: m,
								channelId: channel.dataValues.id,
							}));

							await models.PCMember.bulkCreate(dmMembersToCreate, {
								transaction,
							});

							return channel;
						}
					);

					return {
						success: true,
						channel,
					};
				} catch (err) {
					return { success: false, errors: formatErrors(err, models) };
				}
			}
		),
	},
};
