import { MongoClient } from "mongodb";
import { schema } from "./schema.ts";
import { resolvers } from "./resolvers.ts"
import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"

const MONGO_URL = Deno.env.get("MONGO_URL")
if(!MONGO_URL) throw new Error("No hay mongo")

const mongoDB = new MongoClient(MONGO_URL)
await mongoDB.connect()

console.info("Conectado a mongo")




const server = new ApolloServer({
  typeDefs: schema,
  resolvers
})

const {url} = await startStandaloneServer(server,{
  context: async () => ({}),
  listen: {port: 4000}
})

console.info(`Corriendo en ${url}`)