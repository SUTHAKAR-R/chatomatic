import { 
	ApolloClient, 
	ApolloProvider as Provider, 
	InMemoryCache, 
	createHttpLink, 
	split } from '@apollo/client'

import { setContext } from '@apollo/client/link/context'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'


let httpLink = new createHttpLink({ uri: 'http://localhost:5000' })

const authLink = setContext(() => {

	const token = localStorage.getItem('token')

	return {
		headers: {
			authorization: token ? `Bearer ${token}` : ''
		}
	}
})

httpLink = authLink.concat(httpLink)

const wsLink = new WebSocketLink({
	uri: `ws://localhost:5000/graphql`,
	options: {
		reconnect: true,
		connectionParams: {
			Authorization: `Bearer ${localStorage.getItem('token')}`
		}
	}
})


const splitLink = split(
	({ query }) => {
		const definition = getMainDefinition(query);
		return (
		definition.kind === 'OperationDefinition' &&
		definition.operation === 'subscription'
		)
	},
	wsLink,
	httpLink
)

const client = new ApolloClient({
	link: splitLink,
	cache: new InMemoryCache(),
	connectToDevTools: true
})

const ApolloProvider = (props) => {

	return <Provider client={client} {...props} /> 

}

export default ApolloProvider
