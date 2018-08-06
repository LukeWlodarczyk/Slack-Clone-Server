import { formatErrors } from '../helpers/formatErrors';
import { requiresAuth, requiresTeamAccess } from '../helpers/permissions';

export default {
	Query: {
		directMessages: requiresAuth.createResolver(
			async (parent, { teamId, otherUserId }, { models, user }) =>
				await models.DirectMessage.findAll({
					order: [['created_at', 'ASC']],
					where: {
						teamId,
						[models.sequelize.Op.or]: [
							{
								[models.sequelize.Op.and]: [
									{ receiverId: otherUserId },
									{ senderId: user.id },
								],
							},
							{
								[models.sequelize.Op.and]: [
									{ receiverId: user.id },
									{ senderId: otherUserId },
								],
							},
						],
					},
				})
		),
	},
	DirectMessage: {
		sender: async ({ senderId }, args, { models }) =>
			await models.User.findOne({
				where: {
					id: senderId,
				},
			}),
	},
	Mutation: {
		createDirectMessage: requiresAuth.createResolver(
			async (parent, args, { models, user }) => {
				try {
					console.log(args);
					const directMessage = await models.DirectMessage.create({
						...args,
						senderId: user.id,
					});

					return {
						success: true,
					};
				} catch (err) {
					return { success: false, errors: formatErrors(err, models) };
				}
			}
		),
	},
};
