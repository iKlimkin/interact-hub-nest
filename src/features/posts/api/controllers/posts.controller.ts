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
import { CommandBus } from '@nestjs/cqrs';
import { SortingQueryModel } from '../../../../domain/sorting-base-filter';
import { CurrentUserId } from '../../../../infra/decorators/current-user-id.decorator';
import { SetUserIdGuard } from '../../../../infra/guards/set-user-id.guard';
import { OutputId, likesStatus } from '../../../../domain/likes.types';
import { PaginationViewModel } from '../../../../domain/pagination-view.model';
import { getStatusCounting } from '../../../../infra/utils/status-counter';
import { UsersQueryRepository } from '../../../admin/api/query-repositories/users.query.repo';
import { CurrentUserInfo } from '../../../auth/infrastructure/decorators/current-user-info.decorator';
import { AccessTokenGuard } from '../../../auth/infrastructure/guards/accessToken.guard';
import { BasicSAAuthGuard } from '../../../auth/infrastructure/guards/basic-auth.guard';
import { CommentsViewModel } from '../../../comments/api/models/comments.view.models/comments.view.model';
import {
  InputCommentModel,
  InputContentModel,
} from '../../../comments/api/models/input.comment.models';
import { FeedbacksQueryRepository } from '../../../comments/api/query-repositories/feedbacks.query.repository';
import { FeedbacksService } from '../../../comments/application/feedbacks.service';
import { PostsService } from '../../application/posts.service';
import { CreatePostCommand } from '../../application/use-cases/create-post-use-case';
import { DeletePostCommand } from '../../application/use-cases/delete-post-use-case';
import { UpdatePostCommand } from '../../application/use-cases/update-post-use-case';
import { InputPostModel } from '../models/input.posts.models/create.post.model';
import { InputLikeStatusModel } from '../models/input.posts.models/input-post..model';
import { PostViewModel } from '../models/post.view.models/PostViewModel';
import { PostsQueryRepository } from '../query-repositories/posts.query.repo';
import { UserInfoType } from '../../../auth/api/models/user-models';
import { CreateCommentCommand } from '../../../comments/application/use-cases/commands/create-comment.command';
import { CommentDocument } from '../../../comments/domain/entities/comment.schema';
import { userInfo } from 'os';

@Controller('posts')
export class PostsController {
  constructor(
    private feedbacksQueryRepo: FeedbacksQueryRepository,
    private postsQueryRepo: PostsQueryRepository,
    private postsService: PostsService,
    private feedbacksService: FeedbacksService,
    private usersQueryRepo: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(SetUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getPosts(
    @Query() query: SortingQueryModel,
    @CurrentUserId() userId: string,
  ): Promise<PaginationViewModel<PostViewModel>> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchLoginTerm } =
      query;

    return this.postsQueryRepo.getAllPosts(
      {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        searchLoginTerm,
      },
      userId,
    );
  }

  @Get(':id')
  @UseGuards(SetUserIdGuard)
  async getPostById(
    @Param('id') postId: string,
    @CurrentUserId() userId: string,
  ): Promise<PostViewModel> {
    const foundPost = await this.postsQueryRepo.getPostById(postId, userId);

    if (!foundPost) {
      throw new NotFoundException('post not found');
    }

    return foundPost;
  }

  @Put(':id/like-status')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikesStatus(
    @Param('id') postId: string,
    @Body() status: InputLikeStatusModel,
    @CurrentUserInfo() userInfo: UserInfoType,
  ) {
    const { userId } = userInfo;
    const { likeStatus } = status;

    const foundPost = await this.postsQueryRepo.getPostById(postId, userId);

    if (!foundPost) {
      throw new NotFoundException('Post not found');
    }

    if (foundPost.extendedLikesInfo.myStatus === likeStatus) return;

    const { likesCount, dislikesCount } = getStatusCounting(
      likeStatus,
      foundPost.extendedLikesInfo.myStatus || likesStatus.None,
    );

    const foundUser = await this.usersQueryRepo.getUserById(userId);

    const likeData = {
      postId,
      userId,
      login: foundUser!.login,
      status: likeStatus,
      likesCount,
      dislikesCount,
    };

    // into service and make up in one use-case
    if (!foundPost.extendedLikesInfo.myStatus) {
      const createdLikeStatus = await this.postsService.createLike(likeData);
      return;
    }
    await this.postsService.updateLike(likeData);
  }

  @Get(':id/comments')
  @UseGuards(SetUserIdGuard)
  async getCommentsByPostId(
    @Param('id') postId: string,
    @CurrentUserId() userId: string,
    @Query() query: SortingQueryModel,
  ): Promise<PaginationViewModel<CommentsViewModel>> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchContentTerm } =
      query;
    console.log({ searchContentTerm });

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

    return comments;
  }

  @Post(':id/comments')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCommentByPostId(
    @Param('id') postId: string,
    @Body() body: InputContentModel,
    @CurrentUserInfo() userInfo: UserInfoType,
  ): Promise<CommentsViewModel> {
    const { content } = body;
    const { userId } = userInfo;

    const existPost = await this.postsQueryRepo.getPostById(postId);

    if (!existPost) {
      throw new NotFoundException('Post not found');
    }

    const createCommentData: InputCommentModel = {
      content,
      userId,
      postId,
    };

    const command = new CreateCommentCommand(createCommentData);

    const { _id } = await this.commandBus.execute<
      CreateCommentCommand,
      CommentDocument
    >(command);

    const foundNewComment = await this.feedbacksQueryRepo.getCommentById(
      _id.toString(),
    );

    return foundNewComment!;
  }

  @Post()
  @UseGuards(BasicSAAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body() createPostDto: InputPostModel,
  ): Promise<PostViewModel> {
    const command = new CreatePostCommand(createPostDto);

    const post = await this.commandBus.execute<CreatePostCommand, OutputId>(
      command,
    );

    const newlyCreatedPost = await this.postsQueryRepo.getPostById(post.id);

    if (!newlyCreatedPost) {
      throw new NotFoundException('Post not found');
    }

    return newlyCreatedPost;
  }

  @Put(':id')
  @UseGuards(BasicSAAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') postId: string,
    @Body() inputPostDto: InputPostModel,
  ) {
    const command = new UpdatePostCommand({ inputPostDto, postId });

    const updatedPost = await this.commandBus.execute<
      UpdatePostCommand,
      boolean
    >(command);

    if (!updatedPost) {
      throw new NotFoundException('Post or blog not found');
    }
  }

  @Delete(':id')
  @UseGuards(BasicSAAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') postId: string) {
    const deletedPost = await this.commandBus.execute(
      new DeletePostCommand(postId),
    );

    if (!deletedPost) {
      throw new NotFoundException('Post not found');
    }
  }
}
