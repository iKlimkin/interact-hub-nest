import { Post, PostModelType } from '../posts.schema';
import { InjectModel } from '@nestjs/mongoose';
import { OutputId, likeUserInfo } from 'src/infra/likes.types';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UpdatePostModel } from '../api/models/input.posts.models/update.post.model';
import { PostType } from '../api/models/output.post.models/output.post.models';
import { PostDBType } from '../api/models/post.view.models/getPostViewModel';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private readonly PostModel: PostModelType,
  ) {}

  async create(postDto: Readonly<PostType>): Promise<OutputId> {
    try {
      const createdPost = await this.PostModel.create(postDto);

      return {
        id: createdPost._id.toString(),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails during create operate',
      );
    }
  }

  async updatePost(
    postId: string,
    updateData: UpdatePostModel,
  ): Promise<boolean> {
    try {
      const post = await this.PostModel.updateOne(
        { _id: postId },
        {
          $set: {
            title: updateData.title,
            shortDescription: updateData.shortDescription,
            content: updateData.content,
            blogId: updateData.blogId,
          },
        },
      );

      return post.matchedCount === 1;
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails during update operate',
      );
    }
  }

  async save(postDto: PostType): Promise<OutputId> {
    try {
      const createdPost = await this.PostModel.create(postDto);

      return {
        id: createdPost._id.toString(),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails during save operate',
      );
    }
  }

  async createLikeStatus(likeInfo: likeUserInfo): Promise<boolean> {
    try {
      const createdLikeStatus = await this.PostModel.findByIdAndUpdate(
        likeInfo.postId,
        {
          $addToSet: {
            likesUserInfo: {
              userId: likeInfo.userId,
              status: likeInfo.status,
              login: likeInfo.login,
              addedAt: new Date().toISOString(),
            },
          },
          $inc: {
            'likesCountInfo.likesCount': likeInfo.likesCount,
            'likesCountInfo.dislikesCount': likeInfo.dislikesCount,
          },
        },
        { new: true },
      );

      return createdLikeStatus !== null;
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails during create like-status operate',
      );
    }
  }

  async updateLikeStatus(likeInfo: likeUserInfo): Promise<PostDBType | null> {
    try {
      return this.PostModel.findOneAndUpdate(
        {
          _id: likeInfo.postId,
          likesUserInfo: { $elemMatch: { userId: likeInfo.userId } },
        },
        {
          $set: {
            'likesUserInfo.$.status': likeInfo.status,
          },

          $inc: {
            'likesCountInfo.likesCount': likeInfo.likesCount,
            'likesCountInfo.dislikesCount': likeInfo.dislikesCount,
          },
        },

        { new: true },
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails during update operate',
      );
    }
  }

  async deletePost(searchId: string): Promise<PostDBType> {
    try {
      return this.PostModel.findByIdAndDelete(searchId).lean();
    } catch (error) {
      throw new InternalServerErrorException(
        'Database fails during delete operate',
      );
    }
  }
}
