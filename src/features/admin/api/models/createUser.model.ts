export type CreateUserDto = {
     login: string, 
     email: string, 
     passwordHash: string, 
     passwordSalt: string
     isConfirmed: boolean
}