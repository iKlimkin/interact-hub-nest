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
  Res
} from '@nestjs/common';
import { Response } from 'express';
import { PostsService } from 'src/features/posts/domain/posts.service';
import { PostsQueryRepository } from 'src/features/posts/infrastructure/posts.query.repo';
import { CreatePostModel } from 'src/features/posts/models/input.posts.models/CreatePostModel';
import { PostViewModel } from 'src/features/posts/models/post.view.models/PostViewModel';
import { SortingQueryModel } from '../../../general-models/SortingQueryModel';
import { PaginationViewModel } from '../../../general-models/paginationViewModel';
import { BlogsService } from '../../domain/blogs.service';
import { BlogsQueryRepo } from '../../infrastructure/blogs.query.repo';
import { BlogViewModel } from '../models/blog.view.models/blog.view.models';
import { CreateBlogModel } from '../models/inputBlogsModels/CreateBlogModel';
import { URIParamsBlogModel } from '../models/inputBlogsModels/URIParamsBlogModel';
import { UpdateBlogModel } from '../models/inputBlogsModels/UpdateBlogModel';
import { BlogType } from '../models/outputModels/blog.models';

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
    @Res() res: Response<PaginationViewModel<BlogType>>,
  ) {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
      query;

    const receivedBlogs = await this.blogsQueryRepo.getBlogsByQuery({
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchNameTerm,
    });

    res.send(receivedBlogs);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getBlogById(
    @Param() params: URIParamsBlogModel,
    @Res() res: Response<BlogViewModel>,
  ) {
    const { blogId } = params;

    const foundBlog = await this.blogsQueryRepo.getBlogById(blogId);

    if (!foundBlog) {
      throw new NotFoundException('blog not found');
    }

    res.send(foundBlog);
  }

  @Get(':id/posts')
  @HttpCode(HttpStatus.OK)
  async getPostsByBlogId(
    @Param() params: URIParamsBlogModel,
    @Query() query: SortingQueryModel,
    @Res() res: Response<PaginationViewModel<PostViewModel>>,
  ) {
    const { blogId } = params;
    const { userId } = res.locals;
    let { pageNumber, pageSize, sortBy, sortDirection } = query;

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
  @HttpCode(HttpStatus.CREATED)
  async createBlog(
    @Body() body: CreateBlogModel,
    @Res() res: Response<BlogViewModel>,
  ) {
    const { name, description, websiteUrl } = body;

    const createdBlog = await this.blogsService.createBlog({
      name,
      description,
      websiteUrl,
    });

    const newlyCreatedBlog = await this.blogsQueryRepo.getBlogById(
      createdBlog.id,
    );

    if (!newlyCreatedBlog) {
      throw new NotFoundException('Newlest created blog not found')
    }

    res.send(newlyCreatedBlog);
  }

  @Post(':id/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostByBlogId(
    @Param('id') blogId: string,
    @Body() body: CreatePostModel,
    @Res() res: Response<PostViewModel>,
  ) {
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
      throw new NotFoundException('Newlest post not found')
    }

    res.send(newlyCreatedPost);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') blogId: string, @Body() body: UpdateBlogModel) {
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string) {
    const deleteBlog = await this.blogsService.deleteBlog(blogId);
    
    if (!deleteBlog) {
      throw new NotFoundException('blog not found');
    }
  }
}
