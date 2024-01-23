import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { SortingQueryModel } from '../../../../infra/SortingQueryModel';
import { CurrentUserId } from '../../../../infra/decorators/current-user-id.decorator';
import { SetUserIdGuard } from '../../../../infra/guards/set-user-id.guard';
import { PaginationViewModel } from '../../../../infra/paginationViewModel';
import { CommentsViewModel } from '../models/comments.view.models/comments.view.model';

import { CommandBus } from '@nestjs/cqrs';
import { UserInfoType } from '../../../auth/api/models/user-models';
import { CurrentUserInfo } from '../../../auth/infrastructure/decorators/current-user-info.decorator';
import { AccessTokenGuard } from '../../../auth/infrastructure/guards/accessToken.guard';
import { InputLikeStatusModel } from '../../../posts/api/models/input.posts.models/input-post..model';
import { DeleteCommentCommand } from '../../application/use-cases/commands/delete-comment.command';
import { UpdateCommentCommand } from '../../application/use-cases/commands/update-comment.command';
import { UpdateUserReactionCommand } from '../../application/use-cases/commands/update-user-reaction.command';
import { InputContentModel } from '../models/input.comment.models';
import { FeedbacksQueryRepository } from '../query-repositories/feedbacks.query.repository';

@Controller('comments')
export class FeedbacksController {
  constructor(
    private feedbacksQueryRepo: FeedbacksQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get(':id')
  @UseGuards(SetUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getComment(
    @Param('id') commentId: string,
    @CurrentUserId() userId: string,
  ): Promise<CommentsViewModel> {
    const comment = await this.feedbacksQueryRepo.getCommentById(
      commentId,
      userId,
    );

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  @Get('user/:id')
  @HttpCode(HttpStatus.OK)
  async getUserComments(
    @Param('id') userId: string,
    @Query() query: SortingQueryModel,
  ): Promise<PaginationViewModel<CommentsViewModel>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;

    const comment = await this.feedbacksQueryRepo.getCommentsByUserId(userId, {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AccessTokenGuard)
  async updateComment(
    @Param('id') commentId: string,
    @CurrentUserInfo() userInfo: UserInfoType,
    @Body() body: InputContentModel,
  ) {
    const { content } = body;

    const foundedCommentById =
      await this.feedbacksQueryRepo.getCommentById(commentId);

    if (!foundedCommentById) {
      throw new NotFoundException('Comment not found');
    }

    if (userInfo.userId !== foundedCommentById.commentatorInfo.userId) {
      throw new ForbiddenException('Do not have permission');
    }
    const command = new UpdateCommentCommand(commentId, content);

    const updatedComment = await this.commandBus.execute(command);
  }

  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AccessTokenGuard)
  async updateLikesStatus(
    @Param('id') commentId: string,
    @CurrentUserInfo() userInfo: UserInfoType,
    @Body() inputStatus: InputLikeStatusModel,
  ) {
    const { likeStatus } = inputStatus;
    const { userId } = userInfo;

    const foundComment = await this.feedbacksQueryRepo.getCommentById(
      commentId,
      userId,
    );

    if (!foundComment) {
      throw new NotFoundException('Comment not found');
    }

    const { myStatus } = foundComment.likesInfo;

    if (myStatus === likeStatus) return;

    const reactionData = {
      commentId,
      userId,
      inputStatus: likeStatus,
    };

    const command = new UpdateUserReactionCommand(reactionData);

    await this.commandBus.execute(command);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AccessTokenGuard)
  async deleteComment(
    @Param('id') commentId: string,
    @CurrentUserInfo() userInfo: UserInfoType,
  ) {
    const foundedCommentById =
      await this.feedbacksQueryRepo.getCommentById(commentId);

    if (!foundedCommentById) {
      throw new NotFoundException('Comment not found');
    }

    if (userInfo.userId !== foundedCommentById.commentatorInfo.userId) {
      throw new ForbiddenException('Do not have permission');
    }
    const command = new DeleteCommentCommand(commentId);

    const deletedComment = await this.commandBus.execute(command);
  }
}
