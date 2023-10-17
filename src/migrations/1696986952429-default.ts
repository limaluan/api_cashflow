import { MigrationInterface, QueryRunner } from "typeorm";

export class Default1696986952429 implements MigrationInterface {
    name = 'Default1696986952429'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "created_at"`);
    }

}
