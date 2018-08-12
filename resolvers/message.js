import { formatErrors } from '../helpers/formatErrors';
import { requiresAuth, requiresTeamAccess } from '../helpers/permissions';
import { withFilter } from 'apollo-server-express';
import { createWriteStream } from 'fs';

import pubsub from '../helpers/pubsub';
import { storeUpload } from '../helpers/storeUpload';

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
			async (parent, { channelId, cursor }, { models, user }) => {
				const channel = await models.Channel.findOne({
					raw: true,
					where: { id: channelId },
				});

				if (!channel.public) {
					const member = await models.PCMember.findOne({
						raw: true,
						where: { channelId, userId: user.id },
					});

					if (!member) {
						throw new Error('Not Authorized');
					}
				}

				const opts = {
					order: [['created_at', 'DESC']],
					where: { channelId },
					limit: 35,
				};

				if (cursor) {
					opts.where.created_at = {
						[models.sequelize.Op.lt]: cursor,
					};
				}

				return await models.Message.findAll(opts, { raw: true });
			}
		),
	},
	Message: {
		url: ({ url }) => (url ? `http://localhost:5000/${url}` : url),
		user: async ({ userId }, args, { models }) =>
			await models.User.findOne({
				where: {
					id: userId,
				},
			}),
	},
	Mutation: {
		createMessage: requiresAuth.createResolver(
			async (parent, { file, ...args }, { models, user }) => {
				try {
					const messageData = args;

					if (file) {
						const { stream, filename, mimetype } = await file;
						await storeUpload({ stream, filename });

						messageData.filetype = mimetype;
						messageData.url = `files/${filename}`;
					}

					const message = await models.Message.create({
						...messageData,
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
