import { Injectable } from '@nestjs/common';
import { likeUserInfo } from '../../../infra/likes.types';
import { PostDBType } from '../api/models/post.view.models/getPostViewModel';
import { PostsRepository } from '../infrastructure/posts.repository';

@Injectable()
export class PostsService {
  constructor(private postsRepository: PostsRepository) {}

  async createLike(inputData: likeUserInfo): Promise<boolean> {
    return this.postsRepository.createLikeStatus(inputData);
  }

  async updateLike(inputData: likeUserInfo): Promise<PostDBType | null> {
    return this.postsRepository.updateLikeStatus(inputData);
  }
}
