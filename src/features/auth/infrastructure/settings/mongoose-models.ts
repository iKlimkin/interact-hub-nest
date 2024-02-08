import {
  RequestCounter,
  ApiRequestCounterSchema,
} from '../../../../infra/logging/api-request.schema';
import {
  UserAccount,
  UserAccountSchema,
} from '../../../admin/domain/entities/userAccount.schema';
import {
  Security,
  SecuritySchema,
} from '../../../security/domain/entities/security.schema';
import {
  TempUserAccount,
  TempUserAccountSchema,
} from '../../domain/entities/temp-account.schema';

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
    schema: ApiRequestCounterSchema,
  },
];
