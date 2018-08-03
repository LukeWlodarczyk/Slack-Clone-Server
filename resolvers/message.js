import { formatErrors } from '../helpers/formatErrors';
import { requiresAuth } from '../helpers/permissions';

export default {
	Query: {
		channelMessages: requiresAuth.createResolver(
			async (parent, args, { models }) =>
				await models.Message.findAll({
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
					await models.Message.create({ ...args, userId: user.id });
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
