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

export interface LoginUserData {
    email: string
    password: string
}

export interface RequestRegisterUser extends Request {
    body: UserData
}

export interface RequestLoginUser extends Request {
    body: LoginUserData
}
export interface AuthUser extends Request {
    auth: {
        sub: string
        role: string
        id?: string
    }
}

export type AuthCookie = {
    access_token: string
    refresh_token: string
}

export interface IRefreshToken {
    id: string
}

export interface createTenantData {
    name: string
    address: string
}

export interface updateTenantData {
    name?: string
    address?: string
}

export interface RequestUpdateTenant extends Request {
    body: updateTenantData
}

export interface RequestCreateTenant extends Request {
    body: createTenantData
}
