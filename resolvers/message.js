import { formatErrors } from '../helpers/formatErrors';
import { requiresAuth, requiresTeamAccess } from '../helpers/permissions';
import { PubSub, withFilter } from 'apollo-server-express';

const pubsub = new PubSub();

const NEW_CHANNEL_MESSAGE = 'NEW_CHANNEL_MESSAGE';

export default {
	Subscription: {
		newChannelMessage: {
			subscribe: requiresTeamAccess.createResolver(
				withFilter(
					() => pubsub.asyncIterator(NEW_CHANNEL_MESSAGE),
					(payload, { channelId }) => {
						return payload.channelId === channelId;
					}
				)
			),
		},
	},
	Query: {
		channelMessages: requiresAuth.createResolver(
			async (parent, args, { models }) =>
				await models.Message.findAll({
					order: [['created_at', 'ASC']],
					where: { channelId: args.channelId },
				})
		),
	},
	Message: {
		user: async ({ userId }, args, { models }) =>
			await models.User.findOne({
				where: {
					id: userId,
				},
			}),
	},
	Mutation: {
		createMessage: requiresAuth.createResolver(
			async (parent, args, { models, user }) => {
				try {
					const message = await models.Message.create({
						...args,
						userId: user.id,
					});

					pubsub.publish(NEW_CHANNEL_MESSAGE, {
						channelId: args.channelId,
						newChannelMessage: message.dataValues,
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
