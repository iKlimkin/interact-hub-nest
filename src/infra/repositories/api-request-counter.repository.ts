
import { Injectable } from "@nestjs/common"
import { MatchApiLimitType, MatchApiType } from "../interceptors/models/rate-limiter.models"
import { InjectModel } from "@nestjs/mongoose"
import { ApiRequestModelType, RequestCounter } from "./api-request.schema"
import { WithId } from "mongodb"

@Injectable()
export class ApiRequestCounterRepository {
    constructor(@InjectModel(RequestCounter.name) private RequestCounterApiModel: ApiRequestModelType) {}
    async addClientRequest(inputData: MatchApiType): Promise<boolean> {
        try {
            const addedClientInfo = await this.RequestCounterApiModel.insertMany([{ ...inputData }])
            return true
        } catch (error) {
            console.error(`Occured some problems during count client's api requests ${error}`)
            return false
        }
    }

    async getClientRequestsCollection (): Promise<WithId<MatchApiType>[] | null> {
        try {
            const addedClientInfo = await this.RequestCounterApiModel.find()
            
            return addedClientInfo
        } catch (error) {
            console.error(`Occured some problems during count client's api requests ${error}`)
            return null
        }
    }

    async apiClientCounter(inputData: MatchApiLimitType): Promise<number | 0> {
        const { ip, limitTime, url } = inputData
        try {
            const counter = await this.RequestCounterApiModel.countDocuments(
               { ip, url, timestamp: { $gte: limitTime } } 
            ) 
            
            return counter
        } catch (error) {
            console.error(`Occured some problems during add client's api requests ${error}`)
            return 0
        }
    }

    // ttlApiLogsCleaner: async () => {
    //     requestLogsSchema.index( { timestamp: 1 }, { expireAfterSeconds: 3600 } )
    // }
    

}