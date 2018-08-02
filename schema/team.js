export default `
  type Team {
    id: ID!
    name: String!
    owner: User!
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

  type Query {
    allTeams: [Team!]!
  }

  type Mutation {
    createTeam(name: String!): CreateTeamResponse!
    addTeamMember(email: String!, teamId: ID!): VoidResponse!
  }
`;
