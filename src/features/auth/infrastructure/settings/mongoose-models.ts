import { UserAccount, UserAccountSchema } from "src/features/admin/domain/entities/userAccount.schema";
import { Security, SecuritySchema } from "src/features/security/domain/entities/security.schema";
import { TempUserAccount, TempUserAccountSchema } from "../../domain/entities/temp-account.schema";
import { RequestCounter, ApiRequestCounterShema } from "src/infra/repositories/api-request.schema";

export const mongooseModels = [
    {
      name: TempUserAccount.name,
      schema: TempUserAccountSchema,
    },
    {
      name: UserAccount.name,
      schema: UserAccountSchema,
    },
    {
      name: Security.name,
      schema: SecuritySchema,
    },
    {
      name: RequestCounter.name,
      schema: ApiRequestCounterShema,
    },
  ];