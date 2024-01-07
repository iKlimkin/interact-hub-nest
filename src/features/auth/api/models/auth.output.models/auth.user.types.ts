export type LoginCredentials  = {
    loginOrEmail: string
    password: string;
}
export type LoginOrEmailType = {
    login?: string | null
    email?: string | null
    loginOrEmail?: string | null
}

export type AuthUserType = {
    login: string 
    email: string
    password: string
}