export default `
  type Message {
    id: ID!
    text: String!
    user: User!
    channel: Channel!
    created_at: String!
  }

  type CreateMessageResponse {
    success: Boolean!
    errors: [Error!]
  }

  type Subscription {
    newChannelMessage(channelId: ID!): Message!
  }

  type Mutation {
    createMessage(channelId: ID!, text: String!): CreateMessageResponse!
  }

  type Query {
    channelMessages(channelId: ID!): [Message!]!
  }

`;
