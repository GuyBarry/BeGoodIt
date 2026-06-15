import { MigrationInterface, QueryRunner } from 'typeorm';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export class GoogleAuthAndCleanup1776370000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM \`clothing_item\` WHERE \`user_id\` = '${DEMO_USER_ID}'`,
    );
    await queryRunner.query(
      `DELETE FROM \`user\` WHERE \`id\` = '${DEMO_USER_ID}'`,
    );

    await queryRunner.query(
      `ALTER TABLE \`user\` MODIFY \`password_hash\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD COLUMN \`google_id\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD UNIQUE INDEX \`UQ_user_google_id\` (\`google_id\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP INDEX \`UQ_user_google_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP COLUMN \`google_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` MODIFY \`password_hash\` text NOT NULL`,
    );
  }
}
