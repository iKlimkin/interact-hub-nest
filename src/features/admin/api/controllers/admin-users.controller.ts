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
import { AuthUserType } from 'src/features/auth/api/models/auth.output.models/auth.user.types';
import { UsersQueryRepository } from '../../infrastructure/users.query.repo';
import { UserViewModel } from '../models/userAdmin.view.models/userAdmin.view.model';
import { AdminUserService } from '../../domain/user.admins.service';
import { SortingQueryModel } from 'src/features/infra/SortingQueryModel';
import { PaginationViewModel } from 'src/features/infra/paginationViewModel';
import { AuthBasicGuard } from 'src/features/infra/guards/auth.guard';

@UseGuards(AuthBasicGuard)
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
    @Res() res: Response<PaginationViewModel<UserViewModel>>,
  ) {
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

    res.send(user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() body: AuthUserType,
    @Res() res: Response<UserViewModel>,
  ) {
    const { login, email, password } = body;

    const user = await this.usersService.createUser({ login, email, password });

    if (!user) {
      throw new InternalServerErrorException('Database operation failed');
    }

    const foundNewestUser = await this.usersQueryRepo.getUserById(user.id);

    if (!foundNewestUser) {
      throw new NotFoundException('User not found after create');
    }

    res.send(foundNewestUser);
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
