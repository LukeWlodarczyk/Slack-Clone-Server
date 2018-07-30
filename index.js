import express from 'express';
import { ApolloServer, gql, graphiqlExpress } from 'apollo-server-express';

import typeDefs from './schema';
import resolvers from './resolvers';
import models from './models';

const server = new ApolloServer({ typeDefs, resolvers });

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
