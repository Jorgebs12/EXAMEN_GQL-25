import { OptionalId } from "mongodb";

export type RestauranteModel = OptionalId<{
    nombre: string,
    direccion: string,
    ciudad: string,
    telefono: string,
    timezone: string,
    //country: string,
    location: string
    latitude: string,
    longitude: string
}>

export type APIPhone = {
    is_valid: boolean,
    location: string,
    timezones: string[],
}

export type APITime = {
    hour: string,
    minute: string
}

export type APICity = {
    longitude: string,
    latitude: string
}

export type APIClima = {
    temp: string
}