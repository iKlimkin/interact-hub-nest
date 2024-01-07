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
} from '@nestjs/common';
import { SortingQueryModel } from 'src/features/general-models/SortingQueryModel';
import { InputLikeStatus } from 'src/features/general-models/likes.types';
import { PaginationViewModel } from 'src/features/general-models/paginationViewModel';
import { getStatusCounting } from 'src/features/general-models/utils/statusCounter';
import { CommentsViewModel } from '../models/comments.view.models/comments.view.model';
import { InputContentType } from '../models/input.comment.models';
import { FeedbacksService } from '../../domain/feedbacks.service';
import { FeedbacksQueryRepository } from '../../infrastructure/feedbacks.query.repository';
import { Response } from 'express';

@Controller('comments')
export class FeedbacksController {
  constructor(
    private feedbacksQueryRepo: FeedbacksQueryRepository,
    private feedbacksService: FeedbacksService,
  ) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getComment(
    @Param('id') commentId: string,
    @Res() res
  ) {
    const { userId } = res.locals;

    const comment = await this.feedbacksQueryRepo.getCommentById(
      commentId,
      userId,
    );

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    res.send(comment);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  async getUserComments(
    @Param('id') userId: string,
    @Query() query: SortingQueryModel,
    @Res() res: Response<PaginationViewModel<CommentsViewModel>>,
  ) {
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

    res.send(comment);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('id') commentId: string,
    @Body() body: InputContentType,
    @Res() res,
  ) {
    const { content } = body;
    const { userId } = res.locals;

    const foundedCommentById =
      await this.feedbacksQueryRepo.getCommentById(commentId);

    if (!foundedCommentById) {
      throw new NotFoundException('Comment not found');
    }

    if (userId !== foundedCommentById.commentatorInfo.userId) {
      throw new ForbiddenException('Do not have permission');
    }

    const updatedComment = await this.feedbacksService.updateComment(
      commentId,
      content,
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikesStatus(
    @Param('id') commentId: string,
    @Body() body: InputLikeStatus,
    @Res() res,
  ) {
    const { userId } = res.locals;
    const { likeStatus } = body;

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

  @Delete(':id')
  async deleteComment(@Param('id') commentId: string, @Res() res) {
    const { userId } = res.locals;

    const foundedCommentById =
      await this.feedbacksQueryRepo.getCommentById(commentId);

    if (!foundedCommentById) {
      throw new NotFoundException('Comment not found');
    }

    if (userId !== foundedCommentById.commentatorInfo.userId) {
      throw new ForbiddenException('Do not have permission');
    }

    const deletedComment = await this.feedbacksService.deleteComment(commentId);
  }
}
