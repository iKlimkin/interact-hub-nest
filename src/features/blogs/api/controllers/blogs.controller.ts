import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CurrentUserId } from '../../../../infra/decorators/current-user-id.decorator';
import { SetUserIdGuard } from '../../../../infra/guards/set-user-id.guard';
import { OutputId } from '../../../../domain/likes.types';
import { PaginationViewModel } from '../../../../domain/pagination-view.model';
import { BasicSAAuthGuard } from '../../../auth/infrastructure/guards/basic-auth.guard';
import { InputPostModelByBlogId } from '../../../posts/api/models/input.posts.models/create.post.model';
import { PostViewModel } from '../../../posts/api/models/post.view.models/PostViewModel';
import { PostsQueryRepository } from '../../../posts/api/query-repositories/posts.query.repo';
import { CreatePostCommand } from '../../../posts/application/use-cases/create-post-use-case';
import { CreateBlogCommand } from '../../application/use-case/create-blog-use-case';
import { DeletBlogCommand } from '../../application/use-case/delete-blog-use-case';
import { UpdateBlogCommand } from '../../application/use-case/update-blod-use-case';
import { BlogViewModel } from '../models/blog.view.models/blog.view.models';
import { InputBlogModel } from '../models/input.blog.models/create.blog.model';
import { BlogType } from '../models/output.blog.models/blog.models';
import { BlogsQueryRepo } from '../query-repositories/blogs.query.repo';
import { SortingQueryModel } from '../../../../domain/sorting-base-filter';
import { BlogsQueryFilter } from '../models/output.blog.models/blogs-query.filter';
import { ObjectIdPipe } from '../../../../infra/pipes/valid-objectId.pipe';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepo: BlogsQueryRepo,
    private readonly postsQueryRepo: PostsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getBlogs(
    @Query() query: BlogsQueryFilter,
  ): Promise<PaginationViewModel<BlogType>> {
    return this.blogsQueryRepo.getBlogsByQuery(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getBlogById(
    @Param('id', ObjectIdPipe) blogId: string,
  ): Promise<BlogViewModel> {
    const foundBlog = await this.blogsQueryRepo.getBlogById(blogId);

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
    @Query() query: SortingQueryModel,
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
    @Body() createBlogDto: InputBlogModel,
  ): Promise<BlogViewModel> {
    const command = new CreateBlogCommand(createBlogDto);

    const createdBlog = await this.commandBus.execute<
      CreateBlogCommand,
      OutputId
    >(command);

    const newlyCreatedBlog = await this.blogsQueryRepo.getBlogById(
      createdBlog.id,
    );

    if (!newlyCreatedBlog) {
      throw new NotFoundException('Newlest created blog not found');
    }

    return newlyCreatedBlog;
  }

  @Post(':id/posts')
  @UseGuards(BasicSAAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPostByBlogId(
    @Param('id', ObjectIdPipe) blogId: string,
    @Body() body: InputPostModelByBlogId,
  ): Promise<PostViewModel> {
    const command = new CreatePostCommand({ ...body, blogId });

    const createdPost = await this.commandBus.execute(command);

    const newlyCreatedPost = await this.postsQueryRepo.getPostById(
      createdPost.id,
    );

    if (!newlyCreatedPost) {
      throw new NotFoundException('Newlest post not found');
    }

    return newlyCreatedPost;
  }

  @Put(':id')
  @UseGuards(BasicSAAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id', ObjectIdPipe) blogId: string,
    @Body() inputBlogDto: InputBlogModel,
  ) {
    const updatedBlog = await this.commandBus.execute(
      new UpdateBlogCommand({ blogId, ...inputBlogDto }),
    );

    if (!updatedBlog) {
      throw new NotFoundException('blog not found');
    }
  }

  @Delete(':id')
  @UseGuards(BasicSAAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id', ObjectIdPipe) blogId: string) {
    const deleteBlog = await this.commandBus.execute(
      new DeletBlogCommand(blogId),
    );

    if (!deleteBlog) {
      throw new NotFoundException('blog not found');
    }
  }
}
