export type CreatePostByBlog = Omit<CreatePostModel, 'blogId'>

export type CreatePostModel = {
  /**
   *  post's title
   */
  title: string;

  /**
   * shortDescription of the post
   */
  shortDescription: string;

  /**
   * content of existing post
   */
  content: string;

  /**
   * search blog id
   */
  blogId: string

};


export type CreatePostDTO = {

  title: string

  shortDescription: string

  content: string

  blogId: string

  blogName: string
  
  createdAt: string
};