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
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { SortingQueryModel } from 'src/infra/SortingQueryModel';
import { AuthBasicGuard } from 'src/infra/guards/auth.guard';
import { PaginationViewModel } from 'src/infra/paginationViewModel';
import { AdminUserService } from '../../application/user.admins.service';
import { UsersQueryRepository } from '../query-repositories/users.query.repo';
import { InputUserModel } from '../models/create.userAdmin.model';
import { UserViewModel } from '../models/userAdmin.view.models/userAdmin.view.model';

// @UseGuards(AuthBasicGuard)
@Controller('users')
export class AdminUserController {
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
  async deleteuser(@Param('id') userId: string) {
    const deletedUser = await this.usersService.deleteUser(userId);

    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
  }
}
