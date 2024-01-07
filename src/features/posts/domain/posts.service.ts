import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import {
  OutputId,
  likeUserInfo,
} from 'src/features/general-models/likes.types';
import { PostsRepository } from '../infrastructure/posts.repository';
import { CreatePostModel } from '../models/input.posts.models/CreatePostModel';
import { UpdatePostModel } from '../models/input.posts.models/UpdatePostModel';
import { Post } from '../posts.schema';
import { PostDBType } from '../models/post.view.models/getPostViewModel';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async createPost(createData: CreatePostModel): Promise<OutputId> {
    const { title, shortDescription, content, blogId } = createData;

    const foundBlog = await this.blogsRepository.getBlogById(blogId);

    if (!foundBlog) throw new NotFoundException('blog not found');

    const postDto = Post.makeInstance({
      title,
      shortDescription,
      content,
      blogId: foundBlog._id.toString(),
      blogName: foundBlog.name,
    });

    return this.postsRepository.create(postDto);
  }

  async updatePost(
    postId: string,
    updateData: UpdatePostModel,
  ): Promise<boolean> {
    return this.postsRepository.updatePost(postId, updateData);
  }

  async createLike(inputData: likeUserInfo): Promise<boolean> {
    return this.postsRepository.createLikeStatus(inputData)
  }

  async updateLike(inputData: likeUserInfo): Promise<PostDBType | null> {
    return this.postsRepository.updateLikeStatus(inputData);
  }

  async deletePost(searchId: string): Promise<PostDBType> {
    return await this.postsRepository.deletePost(searchId);
  }
}
