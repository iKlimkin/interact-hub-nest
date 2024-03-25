import { DataSource } from 'typeorm';
import { PostReaction } from '../../../features/posts/domain/entities/post-reactions.entity';
import { likesStatus } from '../../../domain/likes.types';
import { Post } from '../../../features/posts/domain/entities/post.entity';
import { UserAccount } from '../../../features/admin/domain/entities/user-account.entity';
import { Blog } from '../../../features/blogs/domain/entities/blog.entity';
import { PostReactionCounts } from '../../../features/posts/domain/entities/post-reaction-counts.entity';

export async function seedAllData(dataSource: DataSource) {
  try {
    const userRepo = dataSource.getRepository('UserAccount');
    const usersCount = await userRepo.count();

    if (!usersCount) {
      await seedUsers(dataSource);
      await seedBlogs(dataSource);
      await seedPosts(dataSource);
      await seedPostReactions(dataSource);
      await seedPostReactionCounts(dataSource);

      console.log('Successfully seeded data');
    }
  } catch (error) {
    console.log(error);
  }
}

const seedUsers = async (dataSource: DataSource) => {
  const userRepo = dataSource.getRepository('UserAccount');

  const expirationDate = new Date();
  expirationDate.setMinutes(expirationDate.getMinutes() + 30);

  const user1 = new UserAccount();
  user1.login = 'user1';
  user1.email = 'user1@example.com';
  user1.password_salt = 'salt';
  user1.password_hash = 'hash';
  user1.confirmation_code = '123';
  user1.confirmation_expiration_date = expirationDate;
  user1.is_confirmed = true;

  const user2 = new UserAccount();
  user2.login = 'user2';
  user2.email = 'user2@example.com';
  user2.password_salt = 'salt2';
  user2.password_hash = 'hash2';
  user2.confirmation_code = '1234';
  user2.confirmation_expiration_date = expirationDate;
  user2.is_confirmed = true;

  const user3 = new UserAccount();
  user3.login = 'user3';
  user3.email = 'user3@example.com';
  user3.password_salt = 'salt3';
  user3.password_hash = 'hash3';
  user3.confirmation_code = '12345';
  user3.confirmation_expiration_date = expirationDate;
  user3.is_confirmed = true;

  await userRepo.save([user1, user2, user3]);
};

const seedBlogs = async (dataSource: DataSource) => {
  const blogRepo = dataSource.getRepository('Blog');
  const blog = new Blog();
  blog.title = 'Blog 1';
  blog.description = 'Description for Blog';
  blog.website_url = 'https://example.com/blog';
  blog.is_membership = false;

  await blogRepo.save(blog);
};

const seedPosts = async (dataSource: DataSource) => {
  const postRepo = dataSource.getRepository('Post');
  const blogRepo = dataSource.getRepository('Blog');

  const blog = (await blogRepo.find())[0];

  const post1 = new Post();
  post1.blog_title = blog.title;
  post1.content = 'content 1';
  post1.title = 'title by post 1';
  post1.short_description = 'short description by post 1';
  post1.blog = blog.id;

  const post2 = new Post();
  post2.blog_title = blog.title;
  post2.content = 'content 2';
  post2.title = 'title by post 2';
  post2.short_description = 'short description by post 2';
  post2.blog = blog.id;

  await postRepo.save([post1, post2]);
};
const seedPostReactions = async (dataSource: DataSource) => {
  const postRepo = dataSource.getRepository('Post');
  const userRepo = dataSource.getRepository('UserAccount');
  const reactionRepo = dataSource.getRepository('PostReaction');

  const post = (await postRepo.find())[0];
  const user1 = (await userRepo.find())[0];
  const user2 = (await userRepo.find())[1];
  const user3 = (await userRepo.find())[2];

  const reaction1 = new PostReaction();
  reaction1.post = post.id;
  reaction1.reaction_type = likesStatus.Like;
  reaction1.user = user1.id;
  reaction1.user_login = user1.login;

  const reaction2 = new PostReaction();
  reaction2.post = post.id;
  reaction2.reaction_type = likesStatus.Like;
  reaction2.user = user1.id;
  reaction2.user_login = user1.login;

  const reaction3 = new PostReaction();
  reaction3.post = post.id;
  reaction3.reaction_type = likesStatus.Like;
  reaction3.user = user1.id;
  reaction3.user_login = user1.login;

  const reaction4 = new PostReaction();
  reaction4.post = post.id;
  reaction4.reaction_type = likesStatus.Like;
  reaction4.user = user2.id;
  reaction4.user_login = user2.login;

  const reaction5 = new PostReaction();
  reaction5.post = post.id;
  reaction5.reaction_type = likesStatus.Dislike;
  reaction5.user = user3.id;
  reaction5.user_login = user3.login;

  await reactionRepo.save([reaction1, reaction2, reaction3, reaction4, reaction5]);
};

const seedPostReactionCounts = async (dataSource: DataSource) => {
  const postRepo = dataSource.getRepository('Post');
  const postReactionCounts = dataSource.getRepository('PostReactionCounts');

  const post = (await postRepo.find())[0];

  const reactionCount = new PostReactionCounts();
  reactionCount.post = post.id;
  reactionCount.dislikes_count = 1;
  reactionCount.likes_count = 4;

  await postReactionCounts.save(reactionCount);
};
