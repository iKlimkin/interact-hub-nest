import {
  BadRequestException,
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
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  OutputId,
  UpdateReactionModelType,
} from '../../../../domain/likes.types';
import { PaginationViewModel } from '../../../../domain/sorting-base-filter';
import { CurrentUserId } from '../../../../infra/decorators/current-user-id.decorator';
import { SetUserIdGuard } from '../../../../infra/guards/set-user-id.guard';
import { ObjectIdPipe } from '../../../../infra/pipes/valid-objectId.pipe';
import { LayerNoticeInterceptor } from '../../../../infra/utils/interlayer-error-handler.ts/error-layer-interceptor';
import { UsersSqlQueryRepository } from '../../../admin/api/query-repositories/users.query.sql-repo';
import { UserInfoType } from '../../../auth/api/models/user-models';
import { CurrentUserInfo } from '../../../auth/infrastructure/decorators/current-user-info.decorator';
import { AccessTokenGuard } from '../../../auth/infrastructure/guards/accessToken.guard';
import { BasicSAAuthGuard } from '../../../auth/infrastructure/guards/basic-auth.guard';
import { CommentsViewModel } from '../../../comments/api/models/comments.view.models/comments.view.model';
import { InputContentModel } from '../../../comments/api/models/input.comment.models';
import { FeedbacksQueryRepository } from '../../../comments/api/query-repositories/feedbacks.query.repository';
import { FeedbacksQuerySqlRepo } from '../../../comments/api/query-repositories/feedbacks.query.sql-repository';
import { CreateCommentSqlCommand } from '../../../comments/application/use-cases/commands/create-comment-sql.command';
import { CreatePostSqlCommand } from '../../application/use-cases/commands/create-post-sql.command';
import { UpdatePostReactionSqlCommand } from '../../application/use-cases/commands/update-post-reaction-sql.use-case';
import { UpdatePostSqlCommand } from '../../application/use-cases/commands/update-post-sql.command';
import { DeletePostCommand } from '../../application/use-cases/delete-post-use-case';
import { InputPostModel } from '../models/input.posts.models/create.post.model';
import { InputLikeStatusModel } from '../models/input.posts.models/input-post..model';
import { PostsQueryFilter } from '../models/output.post.models/posts-query.filter';
import { PostViewModelType } from '../models/post.view.models/post-view-model.type';
import { PostsSqlQueryRepo } from '../query-repositories/posts-query.sql-repo';
import { PostsQueryRepository } from '../query-repositories/posts.query.repo';
import { GetErrors } from '../../../../infra/utils/interlayer-error-handler.ts/user-errors';

@Controller('posts')
export class PostsSqlController {
  constructor(
    private feedbacksQueryRepo: FeedbacksQueryRepository,
    private feedbacksQuerySqlRepo: FeedbacksQuerySqlRepo,
    private postsQueryRepo: PostsQueryRepository,
    private postsSqlQueryRepo: PostsSqlQueryRepo,
    private usersSqlQueryRepository: UsersSqlQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(SetUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getPosts(
    @Query() query: PostsQueryFilter,
    @CurrentUserId() userId: string,
  ): Promise<PaginationViewModel<PostViewModelType>> {
    return this.postsSqlQueryRepo.getAllPosts(query, userId);
  }

  @Get(':id')
  @UseGuards(SetUserIdGuard)
  async getPostById(
    @Param('id', ObjectIdPipe) postId: string,
    @CurrentUserId() userId: string,
  ): Promise<PostViewModelType> {
    const post = await this.postsSqlQueryRepo.getPostById(postId, userId);

    if (!post) {
      throw new NotFoundException('post not found');
    }

    return post;
  }

  @Put(':id/like-status')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikesStatus(
    @Param('id', ObjectIdPipe) postId: string,
    @Body() body: InputLikeStatusModel,
    @CurrentUserInfo() userInfo: UserInfoType,
  ) {
    const { userId } = userInfo;
    const { likeStatus } = body;

    const post = await this.postsSqlQueryRepo.getPostById(postId, userId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.extendedLikesInfo.myStatus === likeStatus) return;

    const user = await this.usersSqlQueryRepository.getUserById(userId);

    const reactionDto: UpdateReactionModelType = {
      postId,
      userId,
      login: user!.login,
      inputStatus: likeStatus,
    };

    const command = new UpdatePostReactionSqlCommand(reactionDto);
    await this.commandBus.execute<UpdatePostReactionSqlCommand, void>(command);
  }

  @Get(':id/comments')
  @UseGuards(SetUserIdGuard)
  async getCommentsByPostId(
    @Param('id', ObjectIdPipe) postId: string,
    @CurrentUserId() userId: string,
    @Query() query: PostsQueryFilter,
  ): Promise<PaginationViewModel<CommentsViewModel>> {
    const post = await this.postsQueryRepo.getPostById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comments = await this.feedbacksQueryRepo.getCommentsByPostId(
      postId,
      query,
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
    @Param('id', ObjectIdPipe) postId: string,
    @Body() body: InputContentModel,
    @CurrentUserInfo() userInfo: UserInfoType,
  ): Promise<CommentsViewModel> {
    const { content } = body;
    const { userId } = userInfo;

    const existPost = await this.postsSqlQueryRepo.getPostById(postId);

    if (!existPost) {
      throw new NotFoundException('Post not found');
    }

    const createCommentData = {
      content,
      userId,
      postId,
    };

    const command = new CreateCommentSqlCommand(createCommentData);

    const result = await this.commandBus.execute<
      CreateCommentSqlCommand,
      LayerNoticeInterceptor<OutputId>
    >(command);

    if (result.hasError()) {
      if (result.code === GetErrors.DatabaseFail) {
        throw new InternalServerErrorException(result.extensions);
      }
      if (result.code === GetErrors.NotFound) {
        throw new NotFoundException(result.extensions)
      }
      if (result.code === GetErrors.IncorrectModel) {
        throw new BadRequestException(result.extensions)
      }
    }

    const foundNewComment = await this.feedbacksQuerySqlRepo.getCommentById(
      result.data!.id,
      userId,
    );

    return foundNewComment!;
  }

  @Post()
  @UseGuards(BasicSAAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body() inputPostModel: InputPostModel,
  ): Promise<PostViewModelType> {
    const command = new CreatePostSqlCommand(inputPostModel);

    const post = await this.commandBus.execute<
      CreatePostSqlCommand,
      LayerNoticeInterceptor<OutputId | null>
    >(command);

    if (post.hasError()) {
      throw new Error(`${post.extensions}`);
    }

    const newlyCreatedPost = await this.postsSqlQueryRepo.getPostById(
      post.data!.id,
    );

    if (!newlyCreatedPost) {
      throw new Error();
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
    const command = new UpdatePostSqlCommand({ inputPostDto, postId });

    const updatedPost = await this.commandBus.execute<
      UpdatePostSqlCommand,
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
    const command = new DeletePostCommand(postId);
    const deletedPost = await this.commandBus.execute<
      DeletePostCommand,
      boolean
    >(command);

    if (!deletedPost) {
      throw new NotFoundException('Post not found');
    }
  }
}
