import { MigrationInterface, QueryRunner } from "typeorm";

export class IndexForBlogsTitle1712141190906 implements MigrationInterface {
    name = 'IndexForBlogsTitle1712141190906'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_reaction" DROP CONSTRAINT "UQ_9fe8fcd01ddc88393c33fccc26e"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "title" ON "blog" ("title") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."title"`);
        await queryRunner.query(`ALTER TABLE "post_reaction" ADD CONSTRAINT "UQ_9fe8fcd01ddc88393c33fccc26e" UNIQUE ("post_id", "user_id")`);
    }

}
