import express from 'express';
import { ApolloServer, gql, graphiqlExpress } from 'apollo-server-express';
import { apolloUploadExpress } from 'apollo-upload-server';
import path from 'path';
import cors from 'cors';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import { createServer } from 'http';
import DataLoader from 'dataloader';

import models from './models';
import { secret, refreshSecret } from './config/keys';

import authorizeUser, { authorizeUserWs } from './middlewares/authorizeUser';
import { channelBatcher, userBatcher } from './helpers/batchFunctions';

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schema')));

const resolvers = mergeResolvers(
	fileLoader(path.join(__dirname, './resolvers'))
);

const app = express();

app.use(
	cors({ origin: 'http://localhost:3000' }),
	express.json(),
	authorizeUser(secret, refreshSecret, models)
);

app.use('/files', express.static('files'));

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: ({ req, connection }) => {
		const loaders = {
			channelLoader: new DataLoader(ids =>
				channelBatcher(ids, models, req.user)
			),
			userLoader: new DataLoader(ids => userBatcher(ids, models)),
		};

		if (connection) {
			return {
				...connection.context,
				...loaders,
			};
		}

		return {
			models,
			user: req.user,
			secret,
			refreshSecret,
			serverUrl: `${req.protocol}://${req.get('host')}`,
			...loaders,
		};
	},
	subscriptions: {
		path: '/subscriptions',
		onConnect: async (connectionParams, webSocket) => {
			const { user } = await authorizeUserWs(
				connectionParams,
				secret,
				refreshSecret,
				models
			);

			return {
				user,
				models,
				secret,
				refreshSecret,
			};
		},
	},
});

server.applyMiddleware({ app });

const httpServer = createServer(app);

server.installSubscriptionHandlers(httpServer);

const PORT = process.env.PORT || 5000;

models.sequelize.sync().then(() => {
	httpServer.listen(PORT, () => {
		console.log(
			`Server ready at http://localhost:${PORT}${server.graphqlPath}`
		);
		console.log(
			`Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`
		);
	});
});
