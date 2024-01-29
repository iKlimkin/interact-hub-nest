import {
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
import { PaginationViewModel } from '../../../../domain/pagination-view.model';
import { SortingQueryModel } from '../../../../domain/sorting-base-filter';
import { ObjectIdPipe } from '../../../../infra/pipes/valid-objectId.pipe';
import { CreateUserErrors } from '../../../../infra/utils/interlayer-error-handler.ts/user-errors';
import { BasicSAAuthGuard } from '../../../auth/infrastructure/guards/basic-auth.guard';
import { AdminUserService } from '../../application/user.admins.service';
import { InputUserModel } from '../models/create-user.model';
import { SAViewModel } from '../models/userAdmin.view.models/userAdmin.view.model';
import { UsersQueryRepository } from '../query-repositories/users.query.repo';

@UseGuards(BasicSAAuthGuard)
@Controller('users')
export class SuperAdminsController {
  constructor(
    private usersQueryRepo: UsersQueryRepository,
    private usersService: AdminUserService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUserAdmins(
    @Query() query: SortingQueryModel,
  ): Promise<PaginationViewModel<SAViewModel>> {
    return this.usersQueryRepo.getAllUsers(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUserAdmin(
    @Param('id', ObjectIdPipe) userId: string,
  ): Promise<SAViewModel | void> {
    const userAdmin = await this.usersQueryRepo.getUserById(userId);

    if (!userAdmin) {
      throw new NotFoundException();
    }

    return userAdmin;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSA(@Body() body: InputUserModel): Promise<SAViewModel> {
    const { login, email, password } = body;

    const result = await this.usersService.createUser({
      login,
      email,
      password,
    });

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
  async deleteSA(@Param('id', ObjectIdPipe) userId: string): Promise<void> {
    const deletedUser = await this.usersService.deleteUser(userId);

    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
  }
}
