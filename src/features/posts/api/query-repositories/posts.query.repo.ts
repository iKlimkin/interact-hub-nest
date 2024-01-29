import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SortingQueryModel } from '../../../../domain/sorting-base-filter';
import { likesStatus } from '../../../../domain/likes.types';
import { PaginationViewModel } from '../../../../domain/pagination-view.model';
import { getLikeStatus } from '../../../../infra/utils/get-like-status';
import { getPagination } from '../../../../infra/utils/pagination';
import { getSearchTerm } from '../../../../infra/utils/search-term-finder';
import { Post, PostModelType } from '../../domain/entities/posts.schema';
import { PostViewModel } from '../models/post.view.models/PostViewModel';
import { getPostViewModel } from '../models/post.view.models/getPostViewModel';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async getAllPosts(
    inputData: SortingQueryModel,
    userId?: string,
  ): Promise<PaginationViewModel<PostViewModel>> {
    const { pageNumber, pageSize, sort, skip } = await getPagination(inputData);
    const { searchContentTerm } = inputData;

    const filter = getSearchTerm({ searchContentTerm });

    try {
      const posts = await this.PostModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .lean()
        .exec();

      const totalCount = await this.PostModel.countDocuments(filter);
      const pagesCount = Math.ceil(totalCount / pageSize);

      return {
        pagesCount,
        page: pageNumber,
        pageSize,
        totalCount,
        items: posts.map((post) => getPostViewModel(post, userId)),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails operate with find posts',
      );
    }
  }

  async getPostsByBlogId(
    blogId: string,
    inputData: SortingQueryModel,
    userId?: string,
  ): Promise<PaginationViewModel<PostViewModel>> {
    const { pageNumber, pageSize, sort, skip } = await getPagination(inputData);
    const filter = getSearchTerm({
      searchContentTerm: inputData.searchContentTerm,
    });

    try {
      const posts = await this.PostModel.find({
        blogId,
        ...filter,
      })
        .sort(sort)
        .skip(skip)
        .limit(pageSize);

      const totalCount = await this.PostModel.countDocuments({
        blogId,
        ...filter,
      });
      const pagesCount = Math.ceil(totalCount / pageSize);

      return {
        pagesCount: pagesCount,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCount,
        items: posts.map((p) => getPostViewModel(p, userId)),
      };
    } catch (e) {
      throw new InternalServerErrorException(
        'Database fails operation with find post by blogId',
      );
    }
  }

  async getUserReactions(
    userId: string,
    postId: string,
  ): Promise<likesStatus | null> {
    try {
      const foundedUserReaction = await this.PostModel.findOne({
        _id: postId,
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
        "Database fails operate with find user's reactions",
      );
    }
  }

  async getPostById(
    postId: string,
    userId?: string,
  ): Promise<PostViewModel | null> {
    try {
      const foundedPost = await this.PostModel.findById(postId);

      if (!foundedPost) return null;

      return getPostViewModel(foundedPost, userId);
    } catch (error) {
      console.error(`Database fails operate during find post ${error}`);
      return null;
    }
  }
}
