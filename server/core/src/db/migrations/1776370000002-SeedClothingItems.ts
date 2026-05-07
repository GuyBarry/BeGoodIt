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
      INSERT INTO \`clothing_item\` (\`id\`, \`user_id\`, \`color_group_id\`, \`category_id\`, \`season_id\`, \`image_url\`, \`style\`) VALUES
      ('ci000001-0000-0000-0000-000000000001', '${USER_ID}', 2,  1, 5, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=533&fit=crop', 'White Button Shirt'),
      ('ci000002-0000-0000-0000-000000000001', '${USER_ID}', 12, 1, 1, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=533&fit=crop', 'Cream Knit Sweater'),
      ('ci000003-0000-0000-0000-000000000001', '${USER_ID}', 1,  1, 2, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=533&fit=crop', 'Black Striped Tee'),
      ('ci000004-0000-0000-0000-000000000001', '${USER_ID}', 4,  1, 2, 'https://images.unsplash.com/photo-1512327428406-f85afeeb5274?w=400&h=533&fit=crop', 'Navy Printed Tee'),
      ('ci000005-0000-0000-0000-000000000001', '${USER_ID}', 1,  2, 5, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=533&fit=crop', 'Black Skinny Jeans'),
      ('ci000006-0000-0000-0000-000000000001', '${USER_ID}', 12, 2, 1, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=533&fit=crop', 'Beige Chinos'),
      ('ci000007-0000-0000-0000-000000000001', '${USER_ID}', 4,  2, 2, 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=400&h=533&fit=crop', 'Navy Mini Skirt'),
      ('ci000008-0000-0000-0000-000000000001', '${USER_ID}', 11, 2, 3, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=533&fit=crop', 'Gray Wide-Leg Trousers'),
      ('ci000009-0000-0000-0000-000000000001', '${USER_ID}', 4,  5, 3, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=533&fit=crop', 'Navy Blazer'),
      ('ci000010-0000-0000-0000-000000000001', '${USER_ID}', 10, 5, 3, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=533&fit=crop', 'Brown Leather Jacket'),
      ('ci000011-0000-0000-0000-000000000001', '${USER_ID}', 11, 5, 4, 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400&h=533&fit=crop', 'Gray Wool Coat'),
      ('ci000012-0000-0000-0000-000000000001', '${USER_ID}', 9,  3, 2, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=533&fit=crop', 'Floral Summer Dress'),
      ('ci000013-0000-0000-0000-000000000001', '${USER_ID}', 1,  3, 5, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=533&fit=crop', 'Black Midi Dress'),
      ('ci000014-0000-0000-0000-000000000001', '${USER_ID}', 12, 3, 1, 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=400&h=533&fit=crop', 'Beige Wrap Dress'),
      ('ci000015-0000-0000-0000-000000000001', '${USER_ID}', 2,  4, 5, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=533&fit=crop', 'White Sneakers'),
      ('ci000016-0000-0000-0000-000000000001', '${USER_ID}', 10, 4, 3, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=533&fit=crop', 'Brown Ankle Boots'),
      ('ci000017-0000-0000-0000-000000000001', '${USER_ID}', 1,  4, 5, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=533&fit=crop', 'Black Heeled Mules'),
      ('ci000018-0000-0000-0000-000000000001', '${USER_ID}', 12, 6, 5, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=533&fit=crop', 'Beige Bucket Bag'),
      ('ci000019-0000-0000-0000-000000000001', '${USER_ID}', 11, 6, 5, 'https://images.unsplash.com/photo-1611923134239-b9be5816a819?w=400&h=533&fit=crop', 'Silver Chain Necklace'),
      ('ci000020-0000-0000-0000-000000000001', '${USER_ID}', 3,  8, 2, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=533&fit=crop', 'Red Sports Set')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM \`clothing_item\` WHERE \`user_id\` = '${USER_ID}'
    `);
  }
}
