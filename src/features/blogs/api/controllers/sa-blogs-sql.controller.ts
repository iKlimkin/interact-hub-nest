import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { OutputId } from '../../../../domain/likes.types';
import { PaginationViewModel } from '../../../../domain/sorting-base-filter';
import { CurrentUserId } from '../../../../infra/decorators/current-user-id.decorator';
import { SetUserIdGuard } from '../../../../infra/guards/set-user-id.guard';
import { ObjectIdPipe } from '../../../../infra/pipes/valid-objectId.pipe';
import { handleErrors } from '../../../../infra/utils/interlayer-error-handler.ts/error-handler';
import { LayerNoticeInterceptor } from '../../../../infra/utils/interlayer-error-handler.ts/error-layer-interceptor';
import { BasicSAAuthGuard } from '../../../auth/infrastructure/guards/basic-auth.guard';
import { InputPostModelByBlogId } from '../../../posts/api/models/input.posts.models/create.post.model';
import { PostsQueryFilter } from '../../../posts/api/models/output.post.models/posts-query.filter';
import { PostViewModelType } from '../../../posts/api/models/post.view.models/post-view-model.type';
import { PostsSqlQueryRepo } from '../../../posts/api/query-repositories/posts-query.sql-repo';
import { CreatePostSqlCommand } from '../../../posts/application/use-cases/commands/create-post-sql.command';
import { DeletePostSqlCommand } from '../../../posts/application/use-cases/commands/delete-post-sql.command';
import { UpdatePostSqlCommand } from '../../../posts/application/use-cases/commands/update-post-sql.command';
import { CreateSABlogSqlCommand } from '../../application/use-case/commands/create-sa-blog-sql.command';
import { DeleteBlogSqlCommand } from '../../application/use-case/commands/delete-blog-sql.command';
import { UpdateSABlogSqlCommand } from '../../application/use-case/commands/update-sa-blog-sql.command copy';
import { BlogsQueryFilter } from '../models/input.blog.models/blogs-query.filter';
import { InputBlogModel } from '../models/input.blog.models/create.blog.model';
import { BlogViewModelType } from '../models/output.blog.models/blog.view.model-type';
import { BlogsSqlQueryRepo } from '../query-repositories/blogs.query.sql-repo';
import { AccessTokenGuard } from '../../../auth/infrastructure/guards/accessToken.guard';
import { UserInfoType } from '../../../auth/api/models/user-models';
import { CurrentUserInfo } from '../../../auth/infrastructure/decorators/current-user-info.decorator';

@UseGuards(AccessTokenGuard)
// @UseGuards(BasicSAAuthGuard)
@Controller('sa/blogs')
export class SABlogsController {
  constructor(
    private readonly blogsSqlQueryRepo: BlogsSqlQueryRepo,
    private readonly postsSqlQueryRepo: PostsSqlQueryRepo,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getBlogs(
    @Query() query: BlogsQueryFilter,
  ): Promise<PaginationViewModel<BlogViewModelType>> {
    return this.blogsSqlQueryRepo.getAllBlogs(query);
  }

  @Get(':id')
  async getBlogById(
    @Param('id', ObjectIdPipe) blogId: string,
  ): Promise<BlogViewModelType> {
    const blog = await this.blogsSqlQueryRepo.getBlogById(blogId);

    if (!blog) throw new NotFoundException('blog not found');

    return blog;
  }

  @Get(':blogId/posts')
  async getPostsByBlogId(
    @CurrentUserInfo() userInfo: UserInfoType,
    @Param('blogId', ObjectIdPipe) blogId: string,
    @Query() query: PostsQueryFilter,
  ): Promise<PaginationViewModel<PostViewModelType>> {
    const blog = await this.blogsSqlQueryRepo.getSABlogById(blogId);

    if (!blog) throw new NotFoundException('blog not found');

    if (userInfo.userId !== blog.ownerInfo.userId)
      throw new ForbiddenException();

    const posts = await this.postsSqlQueryRepo.getPostsByBlogId(
      blogId,
      query,
      userInfo.userId,
    );

    if (!posts) throw new Error();

    return posts;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(
    @Body() createBlogModel: InputBlogModel,
    @CurrentUserInfo() userInfo: UserInfoType,
  ): Promise<BlogViewModelType> {
    const command = new CreateSABlogSqlCommand({
      ...createBlogModel,
      userId: userInfo.userId,
    });

    const blog = await this.commandBus.execute<
      CreateSABlogSqlCommand,
      OutputId
    >(command);

    return (await this.blogsSqlQueryRepo.getBlogById(blog.id))!;
  }

  @Post(':id/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Param('id', ObjectIdPipe) blogId: string,
    @Body() body: InputPostModelByBlogId,
    @CurrentUserInfo() userInfo: UserInfoType,
  ): Promise<PostViewModelType> {
    const blog = await this.blogsSqlQueryRepo.getSABlogById(blogId);

    if (!blog) {
      throw new NotFoundException();
    }

    if (userInfo.userId !== blog.ownerInfo.userId) {
      throw new ForbiddenException();
    }

    const command = new CreatePostSqlCommand({ ...body, blogId });

    const post = await this.commandBus.execute<
      CreatePostSqlCommand,
      LayerNoticeInterceptor<OutputId | null>
    >(command);

    if (post.hasError()) {
      const errors = handleErrors(post.code, post.extensions);
      throw errors.error;
    }

    const result = await this.postsSqlQueryRepo.getPostById(post.data!.id);

    if (!result) throw new Error();

    return result;
  }

  @Put(':id/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id') blogId: string,
    @Param('postId') postId: string,
    @Body() inputPostModel: InputPostModelByBlogId,
    @CurrentUserInfo() userInfo: UserInfoType,
  ) {
    const blog = await this.blogsSqlQueryRepo.getSABlogById(blogId);
    const post = await this.postsSqlQueryRepo.getPostById(postId);

    if (!blog || !post) throw new NotFoundException();

    if (userInfo.userId !== blog.ownerInfo.userId)
      throw new ForbiddenException();

    const command = new UpdatePostSqlCommand({
      inputPostModel: { ...inputPostModel, blogId },
      postId,
    });

    await this.commandBus.execute(command);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') blogId: string,
    @CurrentUserInfo() userInfo: UserInfoType,
    @Body() inputBlogModel: InputBlogModel,
  ) {
    const blog = await this.blogsSqlQueryRepo.getSABlogById(blogId);

    if (!blog) {
      throw new NotFoundException();
    }

    if (userInfo.userId !== blog.ownerInfo.userId) {
      throw new ForbiddenException();
    }

    const command = new UpdateSABlogSqlCommand({ ...inputBlogModel, blogId });

    const result = await this.commandBus.execute<
      UpdateSABlogSqlCommand,
      LayerNoticeInterceptor<boolean>
    >(command);

    if (result.hasError()) {
      const errors = handleErrors(result.code, result.extensions);
      throw errors.error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @Param('id', ObjectIdPipe) blogId: string,
    @CurrentUserInfo() userInfo: UserInfoType,
  ) {
    const blog = await this.blogsSqlQueryRepo.getSABlogById(blogId);

    if (!blog) {
      throw new NotFoundException();
    }

    if (userInfo.userId !== blog.ownerInfo.userId) {
      throw new ForbiddenException();
    }

    const command = new DeleteBlogSqlCommand(blogId);
    this.commandBus.execute(command);
  }

  @Delete(':id/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('id', ObjectIdPipe) blogId: string,
    @Param('postId', ObjectIdPipe) postId: string,
    @CurrentUserInfo() userInfo: UserInfoType,
  ) {
    const blog = await this.blogsSqlQueryRepo.getSABlogById(blogId);
    const post = await this.postsSqlQueryRepo.getPostById(postId);

    if (!blog || !post) throw new NotFoundException();

    if (userInfo.userId !== blog.ownerInfo.userId)
      throw new ForbiddenException();

    const command = new DeletePostSqlCommand(postId);
    this.commandBus.execute(command);
  }
}