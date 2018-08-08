export default `


  type Message {
    id: ID!
    text: String
    user: User!
    channel: Channel!
    created_at: String!
    url: String
    filetype: String
  }

  type CreateMessageResponse {
    success: Boolean!
    errors: [Error!]
  }

  type Subscription {
    newChannelMessage(channelId: ID!): Message!
  }

  type Mutation {
    createMessage(channelId: ID!, text: String, file: Upload): CreateMessageResponse!
  }

  type Query {
    channelMessages(channelId: ID!): [Message!]!
  }

`;
