import { ConfigService } from "@nestjs/config";
import { dbConnectionConfigType } from "../features/auth/config/configuration";


const dbConfig = new ConfigService<dbConnectionConfigType>().get('dbConnection', { infer: true })


export default {
  MONGO_URL:
  process.env.MONGO_URL || `mongodb://127.0.0.1:27017/nest-studying-project` 
};
