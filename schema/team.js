export default `
  type Team {
    id: ID!
    name: String!
    admin: Boolean!
    members: [User!]!
    channels: [Channel!]!
  }

  type CreateTeamResponse {
    success: Boolean!
    team: Team
    errors: [Error!]
  }

  type VoidResponse {
    success: Boolean!
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
