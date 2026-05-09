import { MigrationInterface, QueryRunner } from 'typeorm';

const USER_ID = '00000000-0000-0000-0000-000000000001';

// color_group IDs (from SeedLookupTables order):
//   1=Black  2=White  3=Red   4=Blue  5=Green  6=Yellow
//   7=Orange 8=Purple 9=Pink  10=Brown 11=Gray  12=Beige
//
// garment_category IDs:
//   1=Top  2=Bottom  3=Dress  4=Shoes  5=Outerwear  6=Accessories  7=Undergarment  8=Activewear
//
// season IDs:
//   1=Spring  2=Summer  3=Fall  4=Winter  5=All-Season

export class SeedClothingItems1776370000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`clothing_item\` MODIFY \`image_id\` char(36) NULL
    `);
    await queryRunner.query(`
      INSERT INTO \`clothing_item\` (\`id\`, \`user_id\`, \`color_group_id\`, \`category_id\`, \`season_id\`, \`style\`) VALUES
      ('ci000001-0000-0000-0000-000000000001', '${USER_ID}', 2,  1, 5, 'White Button Shirt'),
      ('ci000002-0000-0000-0000-000000000001', '${USER_ID}', 12, 1, 1, 'Cream Knit Sweater'),
      ('ci000003-0000-0000-0000-000000000001', '${USER_ID}', 1,  1, 2, 'Black Striped Tee'),
      ('ci000004-0000-0000-0000-000000000001', '${USER_ID}', 4,  1, 2, 'Navy Printed Tee'),
      ('ci000005-0000-0000-0000-000000000001', '${USER_ID}', 1,  2, 5, 'Black Skinny Jeans'),
      ('ci000006-0000-0000-0000-000000000001', '${USER_ID}', 12, 2, 1, 'Beige Chinos'),
      ('ci000007-0000-0000-0000-000000000001', '${USER_ID}', 4,  2, 2, 'Navy Mini Skirt'),
      ('ci000008-0000-0000-0000-000000000001', '${USER_ID}', 11, 2, 3, 'Gray Wide-Leg Trousers'),
      ('ci000009-0000-0000-0000-000000000001', '${USER_ID}', 4,  5, 3, 'Navy Blazer'),
      ('ci000010-0000-0000-0000-000000000001', '${USER_ID}', 10, 5, 3, 'Brown Leather Jacket'),
      ('ci000011-0000-0000-0000-000000000001', '${USER_ID}', 11, 5, 4, 'Gray Wool Coat'),
      ('ci000012-0000-0000-0000-000000000001', '${USER_ID}', 9,  3, 2, 'Floral Summer Dress'),
      ('ci000013-0000-0000-0000-000000000001', '${USER_ID}', 1,  3, 5, 'Black Midi Dress'),
      ('ci000014-0000-0000-0000-000000000001', '${USER_ID}', 12, 3, 1, 'Beige Wrap Dress'),
      ('ci000015-0000-0000-0000-000000000001', '${USER_ID}', 2,  4, 5, 'White Sneakers'),
      ('ci000016-0000-0000-0000-000000000001', '${USER_ID}', 10, 4, 3, 'Brown Ankle Boots'),
      ('ci000017-0000-0000-0000-000000000001', '${USER_ID}', 1,  4, 5, 'Black Heeled Mules'),
      ('ci000018-0000-0000-0000-000000000001', '${USER_ID}', 12, 6, 5, 'Beige Bucket Bag'),
      ('ci000019-0000-0000-0000-000000000001', '${USER_ID}', 11, 6, 5, 'Silver Chain Necklace'),
      ('ci000020-0000-0000-0000-000000000001', '${USER_ID}', 3,  8, 2, 'Red Sports Set')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM \`clothing_item\` WHERE \`user_id\` = '${USER_ID}'
    `);
    await queryRunner.query(`
      ALTER TABLE \`clothing_item\` MODIFY \`image_id\` char(36) NOT NULL
    `);
  }
}
