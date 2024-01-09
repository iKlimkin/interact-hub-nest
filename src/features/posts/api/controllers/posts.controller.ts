import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersQueryRepository } from 'src/features/admin/infrastructure/users.query.repo';
import { CommentsViewModel } from 'src/features/comments/api/models/comments.view.models/comments.view.model';
import { InputContentType } from 'src/features/comments/api/models/input.comment.models';
import { FeedbacksService } from 'src/features/comments/domain/feedbacks.service';
import { FeedbacksQueryRepository } from 'src/features/comments/infrastructure/feedbacks.query.repository';
import { SortingQueryModel } from 'src/infra/SortingQueryModel';
import { AuthBasicGuard } from 'src/infra/guards/auth.guard';
import { InputLikeStatus, likesStatus } from 'src/infra/likes.types';
import { PaginationViewModel } from 'src/infra/paginationViewModel';
import { getStatusCounting } from 'src/infra/utils/statusCounter';
import { PostsService } from '../../domain/posts.service';
import { PostsQueryRepository } from '../../infrastructure/posts.query.repo';
import { InputPostModel } from '../models/input.posts.models/create.post.model';
import { PostViewModel } from '../models/post.view.models/PostViewModel'

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
  @UseGuards(AuthBasicGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body() body: InputPostModel,
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
  @UseGuards(AuthBasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(@Param('id') postId: string, @Body() body: InputPostModel) {
    const { title, shortDescription, content, blogId } = body;

    const updatedPost = await this.postsService.updatePost(postId, {
      title,
      shortDescription,
      content,
      blogId,
    });
  }

  @Delete(':id')
  @UseGuards(AuthBasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') postId: string) {
    const deletedPost = await this.postsService.deletePost(postId);
    if (!deletedPost) {
      throw new NotFoundException('Post not found');
    }
  }
}
