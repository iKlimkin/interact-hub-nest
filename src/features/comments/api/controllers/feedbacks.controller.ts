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
  Res,
  UseGuards,
} from '@nestjs/common';

import { SortingQueryModel } from '../../../../infra/SortingQueryModel';
import { CurrentUserId } from '../../../../infra/decorators/current-user-id.decorator';
import { SetUserIdGuard } from '../../../../infra/guards/set-user-id.guard';
import { PaginationViewModel } from '../../../../infra/paginationViewModel';
import { getStatusCounting } from '../../../../infra/utils/statusCounter';
import { FeedbacksService } from '../../application/feedbacks.service';
import { CommentsViewModel } from '../models/comments.view.models/comments.view.model';

import { InputLikeStatusModel } from '../../../posts/api/models/input.posts.models/input-post..model';
import { InputContentModel } from '../models/input.comment.models';
import { FeedbacksQueryRepository } from '../query-repositories/feedbacks.query.repository';
import { AccessTokenGuard } from '../../../auth/infrastructure/guards/accessToken.guard';
import { CurrentUserInfo } from '../../../auth/infrastructure/decorators/current-user-info.decorator';
import { UserInfo } from 'os';
import { UserInfoType } from '../../../auth/api/controllers/auth.controller';

@Controller('comments')
export class FeedbacksController {
  constructor(
    private feedbacksQueryRepo: FeedbacksQueryRepository,
    private feedbacksService: FeedbacksService,
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

  @Get('user/:userId')
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

  @Put(':commentId')
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

    const updatedComment = await this.feedbacksService.updateComment(
      commentId,
      content,
    );
  }

  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AccessTokenGuard)
  async updateLikesStatus(
    @Param('id') commentId: string,
    @CurrentUserInfo() userInfo: UserInfoType,
    @Body() inputStatus: InputLikeStatusModel,
  ) {
    const { likeStatus } = inputStatus;
    const { userId } = userInfo

    const foundComment = await this.feedbacksQueryRepo.getCommentById(
      commentId,
      userId,
    );

    if (!foundComment) {
      throw new NotFoundException('Comment not found');
    }

    if (foundComment.likesInfo.myStatus === likeStatus) return;

    const { likesCount, dislikesCount } = getStatusCounting(
      likeStatus,
      foundComment.likesInfo.myStatus,
    );

    const likeData = {
      commentId,
      userId,
      status: likeStatus,
      likesCount,
      dislikesCount,
    };

    const userReactions = await this.feedbacksQueryRepo.getUserLikes(
      userId,
      commentId,
    );

    if (!userReactions) {
      const createdUserLike = await this.feedbacksService.createLike(likeData);
      return;
    }

    const updatedLike = await this.feedbacksService.updateLike(likeData);
  }

  @Delete(':commentId')
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

    const deletedComment = await this.feedbacksService.deleteComment(commentId);
  }
}
