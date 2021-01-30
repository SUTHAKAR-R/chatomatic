import { ApolloServer } from 'apollo-server'

import typeDefs from './graphql/typeDefs'
import resolvers from './graphql/resolvers/index'
import db from './models/index'

import contextMiddleware from './utils/contextMiddleware'

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: contextMiddleware
})

server.listen({ port: 5000})
    .then(({ url }) => {
        console.log(`Server started at ${url}`)
        db.sequelize.authenticate()
            .then(() => console.log("Database Connected"))
            .catch(err => console.log(err))
    })