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
import { SortingQueryModel } from 'src/infra/SortingQueryModel';
import { AuthBasicGuard } from 'src/infra/guards/basic.guard';
import { PaginationViewModel } from 'src/infra/paginationViewModel';
import { AdminUserService } from '../../application/user.admins.service';
import { InputUserModel } from '../models/create.userAdmin.model';
import { UserViewModel } from '../models/userAdmin.view.models/userAdmin.view.model';
import { UsersQueryRepository } from '../query-repositories/users.query.repo';
import { BasicSAAuthGuard } from 'src/features/auth/infrastructure/guards/basic-auth.guard';

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
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchLoginTerm,
      searchEmailTerm,
    } = query;

    const user = await this.usersQueryRepo.getAllUsers({
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchLoginTerm,
      searchEmailTerm,
    });

    return user;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() body: InputUserModel): Promise<UserViewModel> {
    const { login, email, password } = body;

    const user = await this.usersService.createUser({ login, email, password });

    if (!user) {
      throw new InternalServerErrorException('Database operation failed');
    }

    const foundNewestUser = await this.usersQueryRepo.getUserById(user.id);

    if (!foundNewestUser) {
      throw new NotFoundException('User not found after create');
    }

    return foundNewestUser;
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
