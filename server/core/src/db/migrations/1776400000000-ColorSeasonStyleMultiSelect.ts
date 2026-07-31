import { MigrationInterface, QueryRunner } from 'typeorm';

export class ColorSeasonStyleMultiSelect1776400000000 implements MigrationInterface {
  name = 'ColorSeasonStyleMultiSelect1776400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create style lookup table (IF NOT EXISTS — may already exist from a partial run)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`style\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        UNIQUE INDEX \`IDX_style_name\` (\`name\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE = InnoDB
    `);

    // 2. Seed style lookup table (INSERT IGNORE skips duplicates)
    await queryRunner.query(`
      INSERT IGNORE INTO \`style\` (\`name\`) VALUES
        ('Casual'), ('Formal'), ('Smart Casual'), ('Sporty'), ('Bohemian')
    `);

    // 3. Create join table: clothing_item ↔ color_group
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`clothing_item_color_groups\` (
        \`clothing_item_id\` varchar(36) NOT NULL,
        \`color_group_id\` int NOT NULL,
        INDEX \`IDX_cicg_item\` (\`clothing_item_id\`),
        INDEX \`IDX_cicg_color\` (\`color_group_id\`),
        PRIMARY KEY (\`clothing_item_id\`, \`color_group_id\`),
        CONSTRAINT \`FK_cicg_item\` FOREIGN KEY (\`clothing_item_id\`) REFERENCES \`clothing_item\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_cicg_color\` FOREIGN KEY (\`color_group_id\`) REFERENCES \`color_group\`(\`id\`) ON DELETE CASCADE
      ) ENGINE = InnoDB
    `);

    // 4. Create join table: clothing_item ↔ season
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`clothing_item_seasons\` (
        \`clothing_item_id\` varchar(36) NOT NULL,
        \`season_id\` int NOT NULL,
        INDEX \`IDX_cis_item\` (\`clothing_item_id\`),
        INDEX \`IDX_cis_season\` (\`season_id\`),
        PRIMARY KEY (\`clothing_item_id\`, \`season_id\`),
        CONSTRAINT \`FK_cis_item\` FOREIGN KEY (\`clothing_item_id\`) REFERENCES \`clothing_item\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_cis_season\` FOREIGN KEY (\`season_id\`) REFERENCES \`season\`(\`id\`) ON DELETE CASCADE
      ) ENGINE = InnoDB
    `);

    // 5. Create join table: clothing_item ↔ style
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`clothing_item_styles\` (
        \`clothing_item_id\` varchar(36) NOT NULL,
        \`style_id\` int NOT NULL,
        INDEX \`IDX_cistyle_item\` (\`clothing_item_id\`),
        INDEX \`IDX_cistyle_style\` (\`style_id\`),
        PRIMARY KEY (\`clothing_item_id\`, \`style_id\`),
        CONSTRAINT \`FK_cistyle_item\` FOREIGN KEY (\`clothing_item_id\`) REFERENCES \`clothing_item\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_cistyle_style\` FOREIGN KEY (\`style_id\`) REFERENCES \`style\`(\`id\`) ON DELETE CASCADE
      ) ENGINE = InnoDB
    `);

    // 6. Migrate existing color_group_id → join table (INSERT IGNORE skips already-migrated rows)
    await queryRunner.query(`
      INSERT IGNORE INTO \`clothing_item_color_groups\` (\`clothing_item_id\`, \`color_group_id\`)
      SELECT \`id\`, \`color_group_id\` FROM \`clothing_item\` WHERE \`color_group_id\` IS NOT NULL
    `);

    // 7. Migrate existing season_id → join table
    await queryRunner.query(`
      INSERT IGNORE INTO \`clothing_item_seasons\` (\`clothing_item_id\`, \`season_id\`)
      SELECT \`id\`, \`season_id\` FROM \`clothing_item\` WHERE \`season_id\` IS NOT NULL
    `);

    // 8. Migrate existing style varchar → join table
    await queryRunner.query(`
      INSERT IGNORE INTO \`clothing_item_styles\` (\`clothing_item_id\`, \`style_id\`)
      SELECT ci.\`id\`, s.\`id\`
      FROM \`clothing_item\` ci
      INNER JOIN \`style\` s ON s.\`name\` = ci.\`style\`
      WHERE ci.\`style\` IS NOT NULL
    `);

    // 9. Add new index FIRST so MySQL has a covering index for remaining FK constraints
    const [newIdxExists] = await queryRunner.query(`
      SELECT COUNT(*) AS cnt FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clothing_item'
      AND INDEX_NAME = 'idx_clothing_item_user_category'
    `);
    if (Number(newIdxExists.cnt) === 0) {
      await queryRunner.query(`ALTER TABLE \`clothing_item\` ADD INDEX \`idx_clothing_item_user_category\` (\`user_id\`, \`category_id\`)`);
    }

    // 10. Drop FK constraints for old single-value columns (may already be gone from partial run)
    const [fk1Exists] = await queryRunner.query(`
      SELECT COUNT(*) AS cnt FROM information_schema.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'clothing_item'
      AND CONSTRAINT_NAME = 'FK_cd93050251e6d2fa0eefae9c0f1'
    `);
    if (Number(fk1Exists.cnt) > 0) {
      await queryRunner.query(`ALTER TABLE \`clothing_item\` DROP FOREIGN KEY \`FK_cd93050251e6d2fa0eefae9c0f1\``);
    }
    const [fk2Exists] = await queryRunner.query(`
      SELECT COUNT(*) AS cnt FROM information_schema.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'clothing_item'
      AND CONSTRAINT_NAME = 'FK_c6457c0285595071e5fb841c294'
    `);
    if (Number(fk2Exists.cnt) > 0) {
      await queryRunner.query(`ALTER TABLE \`clothing_item\` DROP FOREIGN KEY \`FK_c6457c0285595071e5fb841c294\``);
    }

    // 11. Drop old index (now safe — new index covers remaining FK constraints)
    const [oldIdxExists] = await queryRunner.query(`
      SELECT COUNT(*) AS cnt FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clothing_item'
      AND INDEX_NAME = 'idx_clothing_item_user_lookups'
    `);
    if (Number(oldIdxExists.cnt) > 0) {
      await queryRunner.query(`ALTER TABLE \`clothing_item\` DROP INDEX \`idx_clothing_item_user_lookups\``);
    }

    // 12. Drop old columns
    const [col1Exists] = await queryRunner.query(`
      SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clothing_item'
      AND COLUMN_NAME = 'color_group_id'
    `);
    if (Number(col1Exists.cnt) > 0) {
      await queryRunner.query(`ALTER TABLE \`clothing_item\` DROP COLUMN \`color_group_id\``);
    }
    const [col2Exists] = await queryRunner.query(`
      SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clothing_item'
      AND COLUMN_NAME = 'season_id'
    `);
    if (Number(col2Exists.cnt) > 0) {
      await queryRunner.query(`ALTER TABLE \`clothing_item\` DROP COLUMN \`season_id\``);
    }
    const [col3Exists] = await queryRunner.query(`
      SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clothing_item'
      AND COLUMN_NAME = 'style'
    `);
    if (Number(col3Exists.cnt) > 0) {
      await queryRunner.query(`ALTER TABLE \`clothing_item\` DROP COLUMN \`style\``);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore columns
    await queryRunner.query(`ALTER TABLE \`clothing_item\` ADD COLUMN \`style\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`clothing_item\` ADD COLUMN \`season_id\` int NULL`);
    await queryRunner.query(`ALTER TABLE \`clothing_item\` ADD COLUMN \`color_group_id\` int NULL`);

    // Restore first style from join table
    await queryRunner.query(`
      UPDATE \`clothing_item\` ci
        INNER JOIN (
          SELECT cis.\`clothing_item_id\`, s.\`name\`
          FROM \`clothing_item_styles\` cis
          INNER JOIN \`style\` s ON s.\`id\` = cis.\`style_id\`
          ORDER BY cis.\`style_id\`
          LIMIT 1
        ) first_s ON ci.id = first_s.clothing_item_id
      SET ci.style = first_s.name
    `);

    // Restore first color from join table
    await queryRunner.query(`
      UPDATE \`clothing_item\` ci
        INNER JOIN (
          SELECT \`clothing_item_id\`, MIN(\`color_group_id\`) AS \`color_group_id\`
          FROM \`clothing_item_color_groups\`
          GROUP BY \`clothing_item_id\`
        ) first_cg ON ci.id = first_cg.clothing_item_id
      SET ci.color_group_id = first_cg.color_group_id
    `);

    // Restore first season from join table
    await queryRunner.query(`
      UPDATE \`clothing_item\` ci
        INNER JOIN (
          SELECT \`clothing_item_id\`, MIN(\`season_id\`) AS \`season_id\`
          FROM \`clothing_item_seasons\`
          GROUP BY \`clothing_item_id\`
        ) first_s ON ci.id = first_s.clothing_item_id
      SET ci.season_id = first_s.season_id
    `);

    // Restore FK constraints
    await queryRunner.query(`
      ALTER TABLE \`clothing_item\`
      ADD CONSTRAINT \`FK_cd93050251e6d2fa0eefae9c0f1\` FOREIGN KEY (\`color_group_id\`) REFERENCES \`color_group\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE \`clothing_item\`
      ADD CONSTRAINT \`FK_c6457c0285595071e5fb841c294\` FOREIGN KEY (\`season_id\`) REFERENCES \`season\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Restore index
    await queryRunner.query(`ALTER TABLE \`clothing_item\` DROP INDEX \`idx_clothing_item_user_category\``);
    await queryRunner.query(`ALTER TABLE \`clothing_item\` ADD INDEX \`idx_clothing_item_user_lookups\` (\`user_id\`, \`category_id\`, \`color_group_id\`)`);

    // Drop join tables
    await queryRunner.query(`DROP TABLE \`clothing_item_styles\``);
    await queryRunner.query(`DROP TABLE \`clothing_item_seasons\``);
    await queryRunner.query(`DROP TABLE \`clothing_item_color_groups\``);
    await queryRunner.query(`DROP TABLE \`style\``);
  }
}
