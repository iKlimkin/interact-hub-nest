import {
  ReactionsCounter,
  likesStatus,
} from '../../../../../domain/likes.types';
import {
  CommentReactionCounter,
  CommentReactionsType,
  CommentSqlDbType,
} from '../output.comment.models/output.comment.models';
import { CommentsViewModel } from './comments.view.model';

const calculateLikesDislikesCount = (
  reactionCounters: CommentReactionCounter[],
  commentId: string,
): ReactionsCounter => {
  const likesCount = +reactionCounters
    .map((counter) =>
      counter.comment_id === commentId ? counter.likes_count : 0,
    )
    .filter(Number);

  const dislikesCount = +reactionCounters
    .map((counter) =>
      counter.comment_id === commentId ? counter.dislikes_count : 0,
    )
    .filter(Number);

  return {
    likesCount: likesCount || 0,
    dislikesCount: dislikesCount || 0,
  };
};

const convertStatus = (
  myReactions: CommentReactionsType[] | likesStatus,
  comment: CommentSqlDbType,
): likesStatus => {
  let result: likesStatus = likesStatus.None;

  if (Array.isArray(myReactions)) {
    result =
      (myReactions
        .filter((r) => r.comment_id === comment.id)
        .map((r) => r.reaction_type)
        .join('') as likesStatus) || likesStatus.None;
  } else {
    result = myReactions || likesStatus.None;
  }

  return result;
};

export const getCommentsSqlViewModel = (
  comment: CommentSqlDbType,
  reactionCounter: CommentReactionCounter[],
  myReactions: CommentReactionsType[] | likesStatus = [],
): CommentsViewModel => {
  const { likesCount, dislikesCount } = calculateLikesDislikesCount(
    reactionCounter,
    comment.id,
  );

  return {
    id: comment.id,
    content: comment.content,
    commentatorInfo: {
      userId: comment.user_id,
      userLogin: comment.user_login,
    },
    createdAt: comment.created_at.toISOString(),
    likesInfo: {
      likesCount,
      dislikesCount,
      myStatus: convertStatus(myReactions, comment),
    },
  };
};
