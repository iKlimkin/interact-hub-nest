import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SortingQueryModel } from 'src/infra/SortingQueryModel';
import { likesStatus } from 'src/infra/likes.types';
import { PaginationViewModel } from 'src/infra/paginationViewModel';
import { getLikeStatus } from 'src/infra/utils/likesStatusFounder';
import { getPagination } from 'src/infra/utils/pagination';
import { getSearchTerm } from 'src/infra/utils/searchTerm';
import { CommentsViewModel } from '../models/comments.view.models/comments.view.model';
import { getCommentsViewModel } from '../models/comments.view.models/get.comments.view.model';
import {
  CommentModelType,
  Comment,
} from '../../domain/entities/comment.schema';

@Injectable()
export class FeedbacksQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async getCommentsByPostId(
    postId: string,
    inputData: SortingQueryModel,
    userId?: string,
  ): Promise<PaginationViewModel<CommentsViewModel> | null> {
    try {
      const { searchContentTerm } = inputData;

      const { pageNumber, pageSize, sort, skip } =
        await getPagination(inputData);

      const filter = getSearchTerm({ searchContentTerm });

      const comments = await this.CommentModel.find({
        postId,
        ...filter,
      })
        .sort(sort)
        .skip(skip)
        .limit(pageSize);

      const totalCount = await this.CommentModel.countDocuments({
        postId,
        ...filter,
      });
      const pagesCount = Math.ceil(totalCount / pageSize);

      return {
        pagesCount: pagesCount,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCount,
        items: comments.map((comment) => getCommentsViewModel(comment, userId)),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails during find comments by postId operation',
        error,
      );
    }
  }

  async getCommentById(
    commentId: string,
    userId?: string,
  ): Promise<CommentsViewModel | null> {
    try {
      const foundedComment = await this.CommentModel.findById(commentId);

      if (!foundedComment) return null;

      return getCommentsViewModel(foundedComment, userId);
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails during find comment by id operation',
        error,
      );
    }
  }

  async getUserLikes(
    userId: string,
    commentId: string,
  ): Promise<likesStatus | null> {
    try {
      const foundedUserReaction = await this.CommentModel.findOne({
        _id: commentId,
        likesUserInfo: {
          $elemMatch: {
            userId,
            status: { $exists: true },
          },
        },
      });

      if (!foundedUserReaction) return null;

      const [status] = getLikeStatus(foundedUserReaction.likesUserInfo, userId);

      return status;
    } catch (error) {
      throw new InternalServerErrorException(
        "Database fails during get user's likes operation in feedback",
        error,
      );
    }
  }

  async getCommentsByUserId(
    userId: string,
    inputData: SortingQueryModel,
  ): Promise<PaginationViewModel<CommentsViewModel>> {
    try {
      const { pageNumber, pageSize, sort, skip } =
        await getPagination(inputData);

      const searchBy = { 'commentatorInfo.userId': userId };

      const userComments = await this.CommentModel.find(searchBy)
        .sort(sort)
        .skip(skip)
        .limit(pageSize);

      const totalCount = await this.CommentModel.countDocuments(searchBy);
      const pagesCount = Math.ceil(totalCount / pageSize);

      return {
        pagesCount: pagesCount,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCount,
        items: userComments.map((comment) =>
          getCommentsViewModel(comment, userId),
        ),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails during find comment by userId operation',
        error,
      );
    }
  }
}