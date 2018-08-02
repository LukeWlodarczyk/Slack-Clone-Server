import { formatErrors } from '../helpers/formatErrors';
import { requiresAuth } from '../helpers/permissions';

export default {
	Mutation: {
		createChannel: requiresAuth.createResolver(
			async (parent, args, { models }) => {
				try {
					const channel = await models.Channel.create(args);

					return { success: true, channel };
				} catch (err) {
					return { success: false, errors: formatErrors(err, models) };
				}
			}
		),
	},
};
