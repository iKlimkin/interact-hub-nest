import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminUserService } from '../../application/user.admins.service';
import { InputUserModel } from '../models/create-user.model';
import { UserViewModel } from '../models/userAdmin.view.models/userAdmin.view.model';
import { UsersQueryRepository } from '../query-repositories/users.query.repo';
import { SortingQueryModel } from '../../../../domain/sorting-base-filter';
import { PaginationViewModel } from '../../../../domain/pagination-view.model';
import { BasicSAAuthGuard } from '../../../auth/infrastructure/guards/basic-auth.guard';
import { CreateUserErrors } from '../../../../infra/utils/interlayer-error-handler.ts/user-errors';
import { LayerNoticeInterceptor } from '../../../../infra/utils/error-layer-interceptor';

@UseGuards(BasicSAAuthGuard)
@Controller('users')
export class SuperAdminsController {
  constructor(
    private usersQueryRepo: UsersQueryRepository,
    private usersService: AdminUserService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers(
    @Query() query: SortingQueryModel,
  ): Promise<PaginationViewModel<UserViewModel>> {
    return await this.usersQueryRepo.getAllUsers(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() body: InputUserModel): Promise<UserViewModel> {
    const { login, email, password } = body;

    const result = await this.usersService.createUser({
      login,
      email,
      password,
    });
    console.log({ result });

    if (result.hasError()) {
      if (result.code === CreateUserErrors.DatabaseFail) {
        throw new InternalServerErrorException(result.extensions);
      }
    }

    const foundNewestUser = await this.usersQueryRepo.getUserById(
      result.data!.userId,
    );

    return foundNewestUser!;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteuser(@Param('id') userId: string): Promise<void> {
    const deletedUser = await this.usersService.deleteUser(userId);

    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
  }
}
