import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSmartBuyTest1776380000000 implements MigrationInterface {
  name = 'AddSmartBuyTest1776380000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`smart_buy_test\` (
        \`id\`              varchar(36)   NOT NULL,
        \`user_id\`         char(36)      NOT NULL,
        \`image_id\`        char(36)      NULL,
        \`name\`            varchar(255)  NOT NULL,
        \`compatibility_pct\` int         NOT NULL,
        \`match_count\`     int           NOT NULL,
        \`outfit_count\`    int           NOT NULL,
        \`matched_items\`   json          NOT NULL,
        \`classification\`  json          NULL,
        \`tested_at\`       datetime(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX \`idx_smart_buy_test_user\` (\`user_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE = InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`smart_buy_test\``);
  }
}
