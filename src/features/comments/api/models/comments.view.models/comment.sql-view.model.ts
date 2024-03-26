import { likesStatus } from '../../../../../domain/likes.types';
import { CommentReaction } from '../../../domain/entities/comment-reactions.entity';
import { Comment } from '../../../domain/entities/comment.entity';
import { CommentSqlDbType } from '../output.comment.models/output.comment.models';
import { CommentsViewModel } from './comments.view.model';

export const getCommentSqlViewModel = (
  comment: CommentSqlDbType,
  myStatus: likesStatus,
): CommentsViewModel => {
  return {
    id: comment.id,
    content: comment.content,
    commentatorInfo: {
      userId: comment.user_id,
      userLogin: comment.user_login,
    },
    createdAt: comment.created_at.toISOString(),
    likesInfo: {
      likesCount: comment.likes_count || 0,
      dislikesCount: comment.dislikes_count || 0,
      myStatus,
    },
  };
};

export const getCommentTORViewModel = (
  comment: Comment,
  myStatus: likesStatus,
): CommentsViewModel => ({
  id: comment.id,
  content: comment.content,
  commentatorInfo: {
    userId: comment.userAccount.id,
    userLogin: comment.user_login,
  },
  createdAt: comment.created_at.toISOString(),
  likesInfo: {
    likesCount: comment.commentReactionCounts?.likes_count || 0,
    dislikesCount: comment.commentReactionCounts?.dislikes_count || 0,
    myStatus,
  },
});
