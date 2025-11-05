import { Request } from 'express'

export interface UserData {
    firstName: string
    lastName: string
    email: string
    password: string
}

export interface userResponse {
    id: number
    firstName: string
    lastName: string
    email: string
    password: string
}

export interface RequestRegisterUser extends Request {
    body: UserData
}
