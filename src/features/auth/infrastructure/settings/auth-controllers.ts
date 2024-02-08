import { SuperAdminsController } from "../../../admin/api/controllers/super-admin.controller"
import { SuperAdminsSQLController } from "../../../admin/api/controllers/super-admin.sql.controller"
import { AuthSQLController } from "../../api/controllers/auth-sql.controller"
import { AuthController } from "../../api/controllers/auth.controller"



export const authControllers = [
    AuthController,
    SuperAdminsController,
]

export const authSQLControllers = [
    AuthSQLController,
    SuperAdminsSQLController
]
