import { WithId } from "mongodb"


export type UserTomporaryAccount = {
    email: string,
    recoveryCode: string,
    expirationDate: string
}

export type TemporaryAccountDBType = WithId<UserTomporaryAccount>