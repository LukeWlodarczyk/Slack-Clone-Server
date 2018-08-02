export default `
  type Channel {
    id: ID!
    name: String!
    public: Boolean!
    messages: [Message!]!
    users: [User!]!
  }

  type CreateChannelResponse {
    success: Boolean!
    channel: Channel
    errors: [Error!]
  }

  type Mutation {
    createChannel(teamId: ID!, name: String!, public: Boolean=false): CreateChannelResponse!
  }
`;
