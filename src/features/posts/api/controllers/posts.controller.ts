import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Res,
  Query,
  Put,
  Body,
  Post,
  InternalServerErrorException,
  Delete,
} from '@nestjs/common';
import { SortingQueryModel } from 'src/features/general-models/SortingQueryModel';
import { PaginationViewModel } from 'src/features/general-models/paginationViewModel';
import { PostsService } from '../../domain/posts.service';
import { PostsQueryRepository } from '../../infrastructure/posts.query.repo';
import { PostViewModel } from '../../models/post.view.models/PostViewModel';
import { Response } from 'express';
import { getStatusCounting } from 'src/features/general-models/utils/statusCounter';
import { UsersQueryRepository } from 'src/features/admin/infrastructure/users.query.repo';
import {
  InputLikeStatus,
  likesStatus,
} from 'src/features/general-models/likes.types';
import { CreatePostModel } from '../../models/input.posts.models/CreatePostModel';
import { UpdatePostModel } from '../../models/input.posts.models/UpdatePostModel';
import { CommentsViewModel } from 'src/features/comments/api/models/comments.view.models/comments.view.model';
import { InputContentType } from 'src/features/comments/api/models/input.comment.models';
import { FeedbacksQueryRepository } from 'src/features/comments/infrastructure/feedbacks.query.repository';
import { FeedbacksService } from 'src/features/comments/domain/feedbacks.service';

@Controller('posts')
export class PostsController {
  constructor(
    private feedbacksQueryRepo: FeedbacksQueryRepository,
    private postsQueryRepo: PostsQueryRepository,
    private postsService: PostsService,
    private feedbacksService: FeedbacksService,
    private usersQueryRepo: UsersQueryRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getPosts(
    @Query() query: SortingQueryModel,
    @Res() res: Response<PaginationViewModel<PostViewModel>>,
  ) {
    const { pageNumber, pageSize, sortBy, sortDirection, searchLoginTerm } =
      query;
    const { userId } = res.locals;

    const posts = await this.postsQueryRepo.getAllPosts(
      {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        searchLoginTerm,
      },
      userId,
    );

    res.send(posts);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPostById(
    @Param('id') postId: string,
    @Res() res: Response<PostViewModel>,
  ) {
    const { userId } = res.locals;

    const foundPost = await this.postsQueryRepo.getPostById(postId, userId);

    if (!foundPost) {
      throw new NotFoundException('post not found');
    }

    res.send(foundPost);
  }

  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikesStatus(
    @Param('id') postId: string,
    @Body() body: InputLikeStatus,
    @Res() res,
  ) {
    const { userId } = res.locals;
    const { likeStatus } = body;

    const foundPost = await this.postsQueryRepo.getPostById(postId, userId);

    if (!foundPost) {
      throw new NotFoundException('Post not found');
    }

    if (foundPost.extendedLikesInfo.myStatus === likeStatus) return;

    const userInfo = await this.usersQueryRepo.getUserById(userId);

    const { likesCount, dislikesCount } = getStatusCounting(
      likeStatus,
      foundPost.extendedLikesInfo.myStatus || likesStatus.None,
    );

    const likeData = {
      postId,
      userId,
      login: userInfo!.login,
      status: likeStatus,
      likesCount,
      dislikesCount,
    };

    const userReactions = await this.postsQueryRepo.getUserReactions(
      userId,
      postId,
    );

    if (!userReactions) {
      const createdLikeStatus = await this.postsService.createLike(likeData);
      return;
    }

    const updatedLike = await this.postsService.updateLike(likeData);
    return;
  }

  @Get(':id/comments')
  @HttpCode(HttpStatus.OK)
  async getCommentsByPostId(
    @Param('id') postId: string,
    @Query() query: SortingQueryModel,
    @Res() res: Response<PaginationViewModel<CommentsViewModel>>,
  ) {
    const { userId } = res.locals;

    let { pageNumber, pageSize, sortBy, sortDirection, searchContentTerm } =
      query;

    const post = await this.postsQueryRepo.getPostById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comments = await this.feedbacksQueryRepo.getCommentsByPostId(
      postId,
      {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        searchContentTerm,
      },
      userId,
    );

    if (!comments) {
      throw new NotFoundException('Comment not found');
    }

    res.send(comments);
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  async createCommentByPostId(
    @Param('id') postId: string,
    @Body() body: InputContentType,
    @Res() res: Response<CommentsViewModel>,
  ) {
    const { userId } = res.locals;
    const { content } = body;

    const createCommentData = {
      content,
      userId,
      postId,
    };

    const createdComment =
      await this.feedbacksService.createComment(createCommentData);

    if (!createdComment) {
      throw new InternalServerErrorException('Database fail operation');
    }

    const foundNewComment = await this.feedbacksQueryRepo.getCommentById(
      createdComment.id,
    );

    res.send(foundNewComment!);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body() body: CreatePostModel,
    @Res() res: Response<PostViewModel>,
  ) {
    const { title, shortDescription, content, blogId } = body;

    const createdPost = await this.postsService.createPost({
      title,
      shortDescription,
      content,
      blogId,
    });

    if (!createdPost) {
      throw new InternalServerErrorException(
        'Database fail during create post',
      );
    }

    const newlyCreatedPost = await this.postsQueryRepo.getPostById(
      createdPost.id,
    );

    if (!newlyCreatedPost) {
      throw new NotFoundException('Post not found');
    }

    res.send(newlyCreatedPost);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(@Param('id') postId: string, @Body() body: UpdatePostModel) {
    const { title, shortDescription, content, blogId } = body; // add validation blogId pipe

    const updatedPost = await this.postsService.updatePost(postId, {
      title,
      shortDescription,
      content,
      blogId,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') postId: string) {
    const deletedPost = await this.postsService.deletePost(postId);
    if (!deletedPost) {
      throw new NotFoundException('Post not found');
    }
  }
}
