import { MigrationInterface, QueryRunner } from 'typeorm';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export class SeedDemoUser1776370000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // gender_id 2 = Female (seeded in SeedLookupTables)
    await queryRunner.query(`
      INSERT INTO \`user\` (
        \`id\`,
        \`username\`,
        \`email\`,
        \`password_hash\`,
        \`gender_id\`,
        \`birthdate\`,
        \`height_cm\`,
        \`body_type\`
      ) VALUES (
        '${DEMO_USER_ID}',
        'Sarah Johnson',
        'sarah@example.com',
        '$2b$10$demoHashNotForAuthJustSeedData000000000000000000000',
        2,
        '1995-06-15',
        165,
        'Athletic'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM \`user\` WHERE \`id\` = '${DEMO_USER_ID}'`);
  }
}
