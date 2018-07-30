export default {
	Mutation: {
		createChannel: async (parent, args, { models }) => {
			try {
				await models.Channel.create(args);
				return true;
			} catch (e) {
				console.log(e);
				return false;
			}
		},
	},
};
