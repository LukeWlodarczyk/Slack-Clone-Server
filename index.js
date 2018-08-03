import express from 'express';
import { ApolloServer, gql, graphiqlExpress } from 'apollo-server-express';
import path from 'path';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import { createServer } from 'http';

import models from './models';
import { secret, refreshSecret } from './config/keys';

import authorizeUser from './middlewares/authorizeUser';

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schema')));

const resolvers = mergeResolvers(
	fileLoader(path.join(__dirname, './resolvers'))
);

const app = express();

app.use(authorizeUser(secret, refreshSecret, models));

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: ({ req }) => ({ models, user: req.user, secret, refreshSecret }),
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
