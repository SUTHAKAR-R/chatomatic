import { gql } from 'apollo-server'

export default gql`

type User {
    username: String!
    email: String
    createdAt: String!
    imageUrl: String
    token: String
    latestMessage: Message
}

type Message {
    uuid: String!
    from: String!
    to: String!
    content: String!
    createdAt: String!
	reactions: [Reaction]
}

type Reaction {
	uuid: String!
	content: String!
	createdAt: String!
	message: Message!
	user: User!
}
type Query {
    getUsers: [User]!
    login(username: String! password: String!): User!
    getMessages(from: String!): [Message]!
}

type Mutation {
    register(username: String! email: String! password: String! confirmPassword: String!): User!
    sendMessage(to: String! content: String!) : Message!
	reactToMessage(uuid: String! content: String!): Reaction!
}

type Subscription  {
    newMessage: Message!
    newReaction: Reaction!
}

`