import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedLookupTables1776370000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Seed color_group
    await queryRunner.query(`
      INSERT INTO \`color_group\` (\`name\`) VALUES
      ('Black'),
      ('White'),
      ('Red'),
      ('Blue'),
      ('Green'),
      ('Yellow'),
      ('Orange'),
      ('Purple'),
      ('Pink'),
      ('Brown'),
      ('Gray'),
      ('Beige')
    `);

    // Seed garment_category
    await queryRunner.query(`
      INSERT INTO \`garment_category\` (\`name\`) VALUES
      ('Top'),
      ('Bottom'),
      ('Dress'),
      ('Shoes'),
      ('Outerwear'),
      ('Accessories'),
      ('Undergarment'),
      ('Activewear')
    `);

    // Seed season
    await queryRunner.query(`
      INSERT INTO \`season\` (\`name\`) VALUES
      ('Spring'),
      ('Summer'),
      ('Fall'),
      ('Winter'),
      ('All-Season')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM \`color_group\``);
    await queryRunner.query(`DELETE FROM \`garment_category\``);
    await queryRunner.query(`DELETE FROM \`season\``);
  }
}
