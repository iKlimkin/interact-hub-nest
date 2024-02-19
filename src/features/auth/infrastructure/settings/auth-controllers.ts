import { SuperAdminsController } from '../../../admin/api/controllers/super-admin.controller';
import { SASqlController } from '../../../admin/api/controllers/sa.sql.controller';
import { SecurityController } from '../../../security/api/security.controller';
import { SecuritySqlController } from '../../../security/api/security.sql-controller';
import { AuthSQLController } from '../../api/controllers/auth-sql.controller';
import { AuthController } from '../../api/controllers/auth.controller';

export const authControllers = [
  AuthController,
  SuperAdminsController,
  SecurityController,
];

export const authSqlControllers = [
  AuthSQLController,
  SASqlController,
  SecuritySqlController,
];
