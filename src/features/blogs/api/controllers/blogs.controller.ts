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
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { PostsService } from 'src/features/posts/application/posts.service';
import { PostsQueryRepository } from 'src/features/posts/api/query-repositories/posts.query.repo';
import { AuthBasicGuard } from 'src/infra/guards/basic.guard';
import { SortingQueryModel } from 'src/infra/SortingQueryModel';
import { PaginationViewModel } from 'src/infra/paginationViewModel';
import { BlogsService } from '../../application/blogs.service';
import { BlogsQueryRepo } from '../query-repositories/blogs.query.repo';
import { BlogViewModel } from '../models/blog.view.models/blog.view.models';
import { InputBlogModel } from '../models/input.blog.models/create.blog.model';
import { BlogType } from '../models/output.blog.models/blog.models';
import { CreatePostModel } from 'src/features/posts/api/models/input.posts.models/create.post.model';
import { PostViewModel } from 'src/features/posts/api/models/post.view.models/PostViewModel';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly blogsQueryRepo: BlogsQueryRepo,
    private readonly postsQueryRepo: PostsQueryRepository,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getBlogs(
    @Query() query: SortingQueryModel,
  ): Promise<PaginationViewModel<BlogType>> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
      query;

    const receivedBlogs = await this.blogsQueryRepo.getBlogsByQuery({
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchNameTerm,
    });

    return receivedBlogs;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getBlogById(@Param('id') blogId: string): Promise<BlogViewModel> {
    const foundBlog = await this.blogsQueryRepo.getBlogById(blogId);

    if (!foundBlog) {
      throw new NotFoundException('blog not found');
    }

    return foundBlog;
  }

  @Get(':id/posts')
  @HttpCode(HttpStatus.OK)
  async getPostsByBlogId(
    @Param('id') blogId: string,
    @Query() query: SortingQueryModel,
    @Res() res: Response<PaginationViewModel<PostViewModel>>,
  ) {
    const { userId } = res.locals;
    const { pageNumber, pageSize, sortBy, sortDirection } = query;

    const blog = await this.blogsQueryRepo.getBlogById(blogId);

    if (!blog) {
      throw new NotFoundException('blog not found');
    }

    const foundPostsByBlogId = await this.postsQueryRepo.getPostsByBlogId(
      blogId,
      {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      },
      userId,
    );

    res.send(foundPostsByBlogId);
  }

  @Post()
  @UseGuards(AuthBasicGuard)
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() body: InputBlogModel): Promise<BlogViewModel> {
    const createdBlog = await this.blogsService.createBlog(body);

    const newlyCreatedBlog = await this.blogsQueryRepo.getBlogById(
      createdBlog.id,
    );

    if (!newlyCreatedBlog) {
      throw new NotFoundException('Newlest created blog not found');
    }

    return newlyCreatedBlog;
  }

  @Post(':id/posts')
  @UseGuards(AuthBasicGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPostByBlogId(
    @Param('id') blogId: string,
    @Body() body: CreatePostModel,
  ): Promise<PostViewModel> {
    const { title, shortDescription, content } = body;

    const createdPost = await this.postsService.createPost({
      title,
      shortDescription,
      content,
      blogId,
    });

    const newlyCreatedPost = await this.postsQueryRepo.getPostById(
      createdPost.id,
    );

    if (!newlyCreatedPost) {
      throw new NotFoundException('Newlest post not found');
    }

    return newlyCreatedPost;
  }

  @Put(':id')
  @UseGuards(AuthBasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') blogId: string, @Body() body: InputBlogModel) {
    const { name, description, websiteUrl } = body;

    const updatedBlog = await this.blogsService.updateBlog(blogId, {
      name,
      description,
      websiteUrl,
    });

    if (!updatedBlog) {
      throw new NotFoundException('blog not found');
    }
  }

  @Delete(':id')
  @UseGuards(AuthBasicGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string) {
    const deleteBlog = await this.blogsService.deleteBlog(blogId);

    if (!deleteBlog) {
      throw new NotFoundException('blog not found');
    }
  }
}
