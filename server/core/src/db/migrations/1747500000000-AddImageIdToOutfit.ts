import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImageIdToOutfit1747500000000 implements MigrationInterface {
  name = 'AddImageIdToOutfit1747500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`outfit\`
      ADD COLUMN \`image_id\` char(36) NULL AFTER \`is_favorite\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`outfit\`
      ADD CONSTRAINT \`FK_outfit_image\`
      FOREIGN KEY (\`image_id\`) REFERENCES \`image\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    // Composite index for listing a user's outfits ordered by newest first
    await queryRunner.query(`
      CREATE INDEX \`idx_outfit_user_created\` ON \`outfit\` (\`user_id\`, \`created_at\` DESC)
    `);
    // Index for filtering outfits that have a generated image (cache-hit checks)
    await queryRunner.query(`
      CREATE INDEX \`idx_outfit_image_id\` ON \`outfit\` (\`image_id\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`idx_outfit_image_id\` ON \`outfit\``);
    await queryRunner.query(`DROP INDEX \`idx_outfit_user_created\` ON \`outfit\``);
    await queryRunner.query(`ALTER TABLE \`outfit\` DROP FOREIGN KEY \`FK_outfit_image\``);
    await queryRunner.query(`ALTER TABLE \`outfit\` DROP COLUMN \`image_id\``);
  }
}
