import { LikeUserType, LikesCountType } from '../../../../domain/likes.types';

export type CreateCommentType = Omit<
  CommentType,
  'likesCountInfo' | 'createdAt' | 'likesUserInfo'
>;

export type CommentType = {
  /**
   *  current content
   */
  content: string;

  /**
   * post's id to create a comment
   */
  postId: string;

  /**
   * info about commentator
   */
  commentatorInfo: {
    /**
     * user's id
     */
    userId: string;

    /**
     * user's login
     */
    userLogin: string;
  };

  /**
   * comment's create date
   */
  createdAt: string;

  likesUserInfo: LikeUserType[];

  likesCountInfo: LikesCountType;
};
