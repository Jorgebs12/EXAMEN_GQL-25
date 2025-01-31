export const schema = `#graphql 

    type Restaurante {
        _id:ID!
        nombre: String!
        #direccion: String!
        #ciudad: String!
        address: String
        telefono: String
        time: String
        datetime: String
    }

    type Query {
        getRestaurant(id:ID): Restaurante
        getRestaurants: [Restaurante!]!
    }

    type Mutation {
        addRestaurant(nombre: String!, direccion: String!, ciudad: String!, telefono: String!): Restaurante!
        deleteRestaurant(id: ID): Boolean!
    }

`