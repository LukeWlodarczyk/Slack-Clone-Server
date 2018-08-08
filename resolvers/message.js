import { formatErrors } from '../helpers/formatErrors';
import { requiresAuth, requiresTeamAccess } from '../helpers/permissions';
import { withFilter } from 'apollo-server-express';
import { createWriteStream } from 'fs';

import pubsub from '../helpers/pubsub';

const NEW_CHANNEL_MESSAGE = 'NEW_CHANNEL_MESSAGE';

const UPLOAD_ROUTE = `${__dirname}/../files`;

const storeUpload = ({ stream, filename }) =>
	new Promise((resolve, reject) =>
		stream
			.pipe(createWriteStream(`${UPLOAD_ROUTE}/${filename}`))
			.on('finish', () => resolve())
			.on('error', reject)
	);

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

					console.log(messageData);

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
					console.log(err);
					return { success: false, errors: formatErrors(err, models) };
				}
			}
		),
	},
};
