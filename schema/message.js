export default `
  type Message {
    id: ID!
    text: String!
    user: User!
    channel: Channel!
    createdAt: String!
  }

  type CreateMessageResponse {
    success: Boolean!
    errors: [Error!]
  }

  type Mutation {
    createMessage(channelId: ID!, text: String!): CreateMessageResponse!
  }

  type Query {
    channelMessages(channelId: ID!): [Message!]!
  }

`;
