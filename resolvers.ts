import { Collection, ObjectId } from "mongodb"
import { APICity, APIClima, APIPhone, APITime, RestauranteModel } from "./types.ts"
import { GraphQLError } from "graphql";

type addArgs = {
    nombre: string,
    telefono: string,
    ciudad: string,
    direccion: string
}

type idArgs = {
    id: string
}

type Context = {
    RestauranteCollection: Collection<RestauranteModel>
    
}

export const resolvers = {

    Mutation: {
        addRestaurant: async(_:unknown, args: addArgs, ctx: Context): Promise<RestauranteModel> => {
            const API_KEY = Deno.env.get("API_KEY")
            if(!API_KEY) throw new GraphQLError("NO HAY API KEY")

            const {nombre, telefono, direccion, ciudad} = args

            const url = `https://api.api-ninjas.com/v1/validatephone?number=${telefono}`

            const data = await fetch(url, {headers: {'X-Api-Key': API_KEY},})

            if(data.status != 200) throw new GraphQLError("API NINJA ERROR")

            const phoneExists = await ctx.RestauranteCollection.countDocuments({telefono})
            if(phoneExists >= 1) throw new GraphQLError("Ya existe el restaurante con ese telefono")

            const response: APIPhone = await data.json()

            const is_valid = response.is_valid
            const location = response.location
            const timezone = response.timezones[0]
            if(!is_valid) throw new GraphQLError("El telfono no es valido")

            const url1 = `https://api.api-ninjas.com/v1/city?name=${location}`
        
            const data1 = await fetch(url1, {headers: {'X-Api-Key': API_KEY},})
            if(data1.status != 200) throw new GraphQLError("API NINJA ERROR")

            const response1: APICity[] = await data1.json()

            const latitude = response1[0].latitude
            const longitude = response1[0].longitude
    
            const {insertedId} = await ctx.RestauranteCollection.insertOne({
                nombre,
                telefono,
                direccion,
                location,
                ciudad,
                timezone,
                latitude,
                longitude
            })
            
            return {
                _id: insertedId,
                nombre,
                telefono,
                direccion,
                location,
                ciudad,
                timezone,
                longitude,
                latitude
            }
        },

        deleteRestaurant: async(_:unknown, args: idArgs, ctx: Context): Promise<boolean> => {
            const {deletedCount} = await ctx.RestauranteCollection.deleteOne({_id: new ObjectId(args.id)})
            return deletedCount === 1
        }
    },

    Query: {
        getRestaurant: async(_:unknown, args: idArgs, ctx: Context): Promise<RestauranteModel | null> => {
            return await ctx.RestauranteCollection.findOne({_id: new ObjectId(args.id)})
        },
        getRestaurants: async(_:unknown, __:unknown, ctx: Context): Promise<RestauranteModel[]> => {
            return await ctx.RestauranteCollection.find().toArray()
        },
    },

    Restaurante: {
        _id: (parent: RestauranteModel): string => parent._id!.toString(),

        datetime: async(parent: RestauranteModel): Promise<string> => {
            const API_KEY = Deno.env.get("API_KEY")
            if(!API_KEY) throw new GraphQLError("NO HAY API KEY")

            const city = parent.timezone

            const url = `https://api.api-ninjas.com/v1/worldtime?timezone=${city}`

            const data = await fetch(url, {headers: {'X-Api-Key': API_KEY},})
            if(data.status != 200) throw new GraphQLError("API NINJA ERROR")

            const response: APITime = await data.json()

            const hour = response.hour
            const minute = response.minute
            const hora = hour + "-" + minute

            return hora
        },

        time: async(parent: RestauranteModel): Promise<string> => {
            const API_KEY = Deno.env.get("API_KEY")
            if(!API_KEY) throw new GraphQLError("NO HAY API KEY")

            const city = parent.ciudad

            const url = `https://api.api-ninjas.com/v1/city?name=${city}`
        
            const data = await fetch(url, {headers: {'X-Api-Key': API_KEY},})
            if(data.status != 200) throw new GraphQLError("API NINJA ERROR")

            const response: APICity[] = await data.json()

            const latitude = response[0].latitude
            const longitude = response[0].longitude

            const url2 = `https://api.api-ninjas.com/v1/weather?lat=${latitude}&lon=${longitude}`
            
            const data2 = await fetch(url2, {headers: {'X-Api-Key': API_KEY},})
            if(data2.status != 200) throw new GraphQLError("API NINJA ERROR")

            const response2: APIClima = await data2.json()

            const temp = response2.temp
            return temp
        },

        address: (parent: RestauranteModel): string => {
            const city = parent.ciudad
            const direccion = parent.direccion
            const location = parent.location

            const todo = direccion + ", " + city + ", " + location

            return todo
        }
    }
}