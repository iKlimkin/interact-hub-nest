import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OutputId } from '../../../domain/likes.types';
import { PostDtoSqlType } from '../api/models/post-sql.model';

@Injectable()
export class PostsSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async save(postDto: Readonly<PostDtoSqlType>): Promise<OutputId | null> {
    try {
      const createQuery = `
        INSERT INTO posts (title, short_description, content, blog_id, blog_title)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;

      const result = await this.dataSource.query(
        createQuery,
        Object.values(postDto.createPostDto),
      );

      return {
        id: result[0].id,
      };
    } catch (error) {
      console.error(`Database fails during save post sql operate ${error}`);
      return null;
    }
  }

  // async updatePost(
  //   postId: string,
  //   updateData: UpdatePostModel,
  // ): Promise<boolean> {
  //   try {
  //     const post = await this.PostModel.updateOne(
  //       {
  //         $and: [
  //           { _id: this.getObjectId(postId) },
  //           { blogId: updateData.blogId },
  //         ],
  //       },
  //       {
  //         $set: {
  //           title: updateData.title,
  //           shortDescription: updateData.shortDescription,
  //           content: updateData.content,
  //           blogId: updateData.blogId,
  //         },
  //       },
  //     );

  //     return post.matchedCount === 1;
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Database fails during update operate',
  //     );
  //   }
  // }

  // private getObjectId(id: string) {
  //   return new ObjectId(id);
  // }

  // async createLikeStatus(likeInfo: likeUserInfo): Promise<boolean> {
  //   try {
  //     const createdLikeStatus = await this.PostModel.findByIdAndUpdate(
  //       new ObjectId(likeInfo.postId),
  //       {
  //         $addToSet: {
  //           likesUserInfo: {
  //             userId: likeInfo.userId,
  //             status: likeInfo.status,
  //             login: likeInfo.login,
  //             addedAt: new Date().toISOString(),
  //           },
  //         },
  //         $inc: {
  //           'likesCountInfo.likesCount': likeInfo.likesCount,
  //           'likesCountInfo.dislikesCount': likeInfo.dislikesCount,
  //         },
  //       },
  //       { new: true },
  //     );

  //     return createdLikeStatus !== null;
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Database fails during create like-status operate',
  //     );
  //   }
  // }

  // async updateLikeStatus(likeInfo: likeUserInfo): Promise<PostDBType | null> {
  //   try {
  //     return this.PostModel.findOneAndUpdate(
  //       {
  //         _id: likeInfo.postId,
  //         likesUserInfo: { $elemMatch: { userId: likeInfo.userId } },
  //       },
  //       {
  //         $set: {
  //           'likesUserInfo.$.status': likeInfo.status,
  //         },

  //         $inc: {
  //           'likesCountInfo.likesCount': likeInfo.likesCount,
  //           'likesCountInfo.dislikesCount': likeInfo.dislikesCount,
  //         },
  //       },

  //       { new: true },
  //     );
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Database fails during update operate',
  //     );
  //   }
  // }

  // async deletePost(searchId: string): Promise<boolean> {
  //   try {
  //     return this.PostModel.findByIdAndDelete(new ObjectId(searchId)).lean();
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Database fails during delete operate',
  //     );
  //   }
  // }
}
