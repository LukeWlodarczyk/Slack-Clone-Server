export default `
  type DirectMessage {
    id: ID!
    text: String!
    sender: User!
    receiverId: ID!
    created_at: String!
  }

  type CreateDirectMessageResponse {
    success: Boolean!
    errors: [Error!]
  }

  type Subscription {
    newDirectMessage(teamId: ID!, userId: ID!): DirectMessage!
  }

  type Mutation {
    createDirectMessage(receiverId: ID!, teamId: ID!, text: String!): CreateDirectMessageResponse!
  }

  type Query {
    directMessages(teamId: ID!, otherUserId: ID!): [DirectMessage!]!
  }

`;
