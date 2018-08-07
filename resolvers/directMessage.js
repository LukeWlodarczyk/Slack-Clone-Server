import { formatErrors } from '../helpers/formatErrors';
import {
	requiresAuth,
	requiresTeamAccess,
	requireDirectMessageSubscription,
} from '../helpers/permissions';

import { withFilter } from 'apollo-server-express';
import pubsub from '../helpers/pubsub';

const NEW_DIRECT_MESSAGE = 'NEW_DIRECT_MESSAGE';

export default {
	Subscription: {
		newDirectMessage: {
			subscribe: requireDirectMessageSubscription.createResolver(
				withFilter(
					() => pubsub.asyncIterator(NEW_DIRECT_MESSAGE),
					(payload, args, { user }) =>
						payload.teamId == args.teamId &&
						((payload.senderId == user.id &&
							payload.receiverId == args.userId) ||
							(payload.senderId == args.userId &&
								payload.receiverId == user.id))
				)
			),
		},
	},
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
					const directMessage = await models.DirectMessage.create({
						...args,
						senderId: user.id,
					});

					pubsub.publish(NEW_DIRECT_MESSAGE, {
						teamId: args.teamId,
						receiverId: args.receiverId,
						senderId: user.id,
						newDirectMessage: {
							...directMessage.dataValues,
							sender: {
								username: user.username,
							},
						},
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
