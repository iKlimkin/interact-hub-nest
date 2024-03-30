import { MigrationInterface, QueryRunner } from "typeorm";

export class FirstMigration1711733430067 implements MigrationInterface {
    name = 'FirstMigration1711733430067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_reaction" DROP CONSTRAINT "UQ_9fe8fcd01ddc88393c33fccc26e"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_reaction" ADD CONSTRAINT "UQ_9fe8fcd01ddc88393c33fccc26e" UNIQUE ("post_id", "user_id")`);
    }

}
