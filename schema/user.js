export default `
  type User {
    id: ID!
    username: String!
    email: String!
    teams: [Team!]!
  }

  type Query {
    getAuthUser: User!
    allUsers: [User!]!
    getUserById(userId: ID!): User
  }

  type RegisterResponse {
    success: Boolean!
    user: User
    errors: [Error!]
  }

  type LoginResponse {
    success: Boolean!
    token: String
    refreshToken: String
    errors: [Error!]
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): RegisterResponse!
    login(email: String!, password: String!): LoginResponse!
  }

`;
