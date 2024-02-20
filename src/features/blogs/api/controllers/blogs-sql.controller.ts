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
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { OutputId } from '../../../../domain/likes.types';
import { PaginationViewModel } from '../../../../domain/sorting-base-filter';
import { CurrentUserId } from '../../../../infra/decorators/current-user-id.decorator';
import { SetUserIdGuard } from '../../../../infra/guards/set-user-id.guard';
import { ObjectIdPipe } from '../../../../infra/pipes/valid-objectId.pipe';
import { BasicSAAuthGuard } from '../../../auth/infrastructure/guards/basic-auth.guard';
import { InputPostModelByBlogId } from '../../../posts/api/models/input.posts.models/create.post.model';
import { PostsQueryFilter } from '../../../posts/api/models/output.post.models/posts-query.filter';
import { PostViewModel } from '../../../posts/api/models/post.view.models/PostViewModel';
import { PostsQueryRepository } from '../../../posts/api/query-repositories/posts.query.repo';
import { CreatePostCommand } from '../../../posts/application/use-cases/create-post-use-case';
import { CreateBlogCommand } from '../../application/use-case/create-blog-use-case';
import { UpdateBlogCommand } from '../../application/use-case/update-blog-use-case';
import { BlogViewModelType } from '../models/output.blog.models/blog.view.model-type';
import { InputBlogModel } from '../models/input.blog.models/create.blog.model';
import { BlogType } from '../models/output.blog.models/blog.models';
import { BlogsQueryFilter } from '../models/input.blog.models/blogs-query.filter';
import { BlogsQueryRepo } from '../query-repositories/blogs.query.repo';
import { DeleteBlogCommand } from '../../application/use-case/delete-blog-use-case';
import { CreateBlogSqlCommand } from '../../application/use-case/commands/create-blog-sql.command';
import { BlogsSqlQueryRepo } from '../query-repositories/blogs.query.sql-repo';
import { UpdateBlogSqlUseCase } from '../../application/use-case/update-blog-sql.use-case';
import { UpdateBlogSqlCommand } from '../../application/use-case/commands/update-blog-sql.command';
import { DeleteBlogSqlCommand } from '../../application/use-case/commands/delete-blog-sql.command';
import { CreatePostSqlCommand } from '../../../posts/application/use-cases/commands/create-post-sql.command';

@Controller('blogs')
export class BlogsSqlController {
  constructor(
    private readonly blogsQueryRepo: BlogsQueryRepo,
    private readonly blogsSqlQueryRepo: BlogsSqlQueryRepo,
    private readonly postsQueryRepo: PostsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getBlogs(
    @Query() query: BlogsQueryFilter,
  ): Promise<PaginationViewModel<BlogViewModelType>> {
    const result = await this.blogsSqlQueryRepo.getAllBlogs(query);

    if (!result) {
      throw new InternalServerErrorException();
    }

    return result
  }

  @Get(':id')
  async getBlogById(
    @Param('id', ObjectIdPipe) blogId: string,
  ): Promise<BlogViewModelType> {
    const foundBlog = await this.blogsSqlQueryRepo.getBlogById(blogId);

    if (!foundBlog) {
      throw new NotFoundException('blog not found');
    }

    return foundBlog;
  }

  @Get(':id/posts')
  @UseGuards(SetUserIdGuard)
  async getPostsByBlogId(
    @CurrentUserId() userId: string,
    @Param('id', ObjectIdPipe) blogId: string,
    @Query() query: PostsQueryFilter,
  ): Promise<PaginationViewModel<PostViewModel>> {
    const blog = await this.blogsQueryRepo.getBlogById(blogId);

    if (!blog) {
      throw new NotFoundException('blog not found');
    }

    const foundPostsByBlogId = await this.postsQueryRepo.getPostsByBlogId(
      blogId,
      query,
      userId,
    );

    return foundPostsByBlogId;
  }

  @Post()
  @UseGuards(BasicSAAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createBlog(
    @Body() createBlogModel: InputBlogModel,
  ): Promise<BlogViewModelType> {
    const command = new CreateBlogSqlCommand(createBlogModel);

    const blog = await this.commandBus.execute<CreateBlogSqlCommand, OutputId>(
      command,
    );

    const result = await this.blogsSqlQueryRepo.getBlogById(blog.id);

    if (!result) throw new Error();

    return result;
  }

  @Post(':id/posts')
  @UseGuards(BasicSAAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPostByBlogId(
    @Param('id', ObjectIdPipe) blogId: string,
    @Body() body: InputPostModelByBlogId,
  ): Promise<PostViewModel> {
    const command = new CreatePostSqlCommand({ ...body, blogId });

    const post = await this.commandBus.execute<CreatePostSqlCommand, OutputId | null>(command);

    if (!post) {
      throw new NotFoundException('Post not created');
    }

    const newlyCreatedPost = await this.postsQueryRepo.getPostById(
      post.id,
    );

    if (!newlyCreatedPost) {
      throw new Error('Newest post not found');
    }

    return newlyCreatedPost;
  }

  @Put(':id')
  @UseGuards(BasicSAAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') blogId: string,
    @Body() inputBlogDto: InputBlogModel,
  ) {
    const result = await this.commandBus.execute(
      new UpdateBlogSqlCommand({ ...inputBlogDto, blogId }),
    );

    if (!result) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @UseGuards(BasicSAAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id', ObjectIdPipe) blogId: string) {
    const command = new DeleteBlogSqlCommand(blogId);
    const result = await this.commandBus.execute(command);

    if (!result) {
      throw new NotFoundException();
    }
  }
}
