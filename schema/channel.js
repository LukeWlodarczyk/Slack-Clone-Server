export default `
  type Channel {
    id: ID!
    names: String!
    messages: [Message!]!
    users: [User!]!
  }

  type Mutation {
    createChannel(teamId: ID!, name: String!, public: Boolean=false): Boolean!
  }
`;
