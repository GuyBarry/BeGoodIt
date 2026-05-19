import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterImageEmbeddingToVarbinary1776390000000 implements MigrationInterface {
    name = 'AlterImageEmbeddingToVarbinary1776390000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // text-embedding-004 produces 768 float32 values = 3072 bytes exactly.
        // VARBINARY(3072) enforces the correct size and is more efficient than LONGBLOB.
        await queryRunner.query(`
            ALTER TABLE \`clothing_item\`
            MODIFY COLUMN \`image_embedding\` VARBINARY(3072) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`clothing_item\`
            MODIFY COLUMN \`image_embedding\` LONGBLOB NULL
        `);
    }
}
