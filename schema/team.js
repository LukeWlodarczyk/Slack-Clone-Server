export default `
  type Team {
    id: ID!
    name: String!
    admin: Boolean!
    directMessageMembers: [User!]!
    channels: [Channel!]!
  }

  type CreateTeamResponse {
    success: Boolean!
    team: Team
    errors: [Error!]
  }

  type VoidResponse {
    success: Boolean!
    user: User
    errors: [Error!]
  }

  type Mutation {
    createTeam(name: String!): CreateTeamResponse!
    addTeamMember(email: String!, teamId: ID!): VoidResponse!
  }

  type Query {
    teamMembers(teamId: ID!): [User!]!
  }
`;
