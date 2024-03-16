import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccounts } from './features/admin/domain/entities/user-account.entity';
import { AuthModule } from './features/auth/auth.module';
import { Blogs } from './features/blogs/domain/entities/blog.entity';
import { Comments } from './features/comments/domain/entities/comments.entity';
import { Posts } from './features/posts/domain/entities/post.entity';
import { configModule } from './settings/app-config.module';
import { controllers } from './settings/app-controllers';
import { providers } from './settings/app-providers';
import { createAsyncMongoConnection } from './settings/app.settings';
import { mongooseSchemas } from './settings/mongoose-schemas';
import { TypeOrmOptions } from './settings/postgres-options';
import { UserSessions } from './features/security/domain/entities/security.entity';
import { PostReactions } from './features/posts/domain/entities/post-reactions.entity';
import { CommentReactions } from './features/comments/domain/entities/comment-reactions.entity';
import { TemporaryUserAccount } from './features/auth/domain/entities/temp-account.entity';
import { ApiRequests } from './infra/logging/domain/entities/api-request.entity';
import { PostReactionCounts } from './features/posts/domain/entities/post-reaction-counts.entity';
import { CommentReactionCounts } from './features/comments/domain/entities/comment-reaction-counts.entity';

@Module({
  imports: [
    configModule,
    MongooseModule.forRootAsync({
      useFactory: createAsyncMongoConnection,
      inject: [ConfigService],
    }),
    MongooseModule.forFeature(mongooseSchemas),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useClass: TypeOrmOptions,
    }),
    TypeOrmModule.forFeature([
      TemporaryUserAccount,
      UserAccounts,
      ApiRequests,
      Comments,
      Posts,
      Blogs,
      UserSessions,
      PostReactions,
      PostReactionCounts,
      CommentReactions,
      CommentReactionCounts,
    ]),
    AuthModule,
  ],
  controllers,
  providers,
})
export class AppModule {}
