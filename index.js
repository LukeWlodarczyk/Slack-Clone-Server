import express from 'express';
import { ApolloServer, gql, graphiqlExpress } from 'apollo-server-express';
import path from 'path';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';

import models from './models';

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schema')));

const resolvers = mergeResolvers(
	fileLoader(path.join(__dirname, './resolvers'))
);

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: { models, user: { id: 1 } },
});

const app = express();
server.applyMiddleware({ app });

const port = process.env.PORT || 5000;

models.sequelize.sync().then(() => {
	app.listen(port, () => {
		console.log(
			`Server is ready at http://localhost:5000${server.graphqlPath}`
		);
	});
});
