import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1776367648999 implements MigrationInterface {
    name = 'InitialSchema1776367648999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`cloth\` (
                \`item_id\` varchar(36) NOT NULL,
                \`user_id\` varchar(36) NOT NULL,
                \`color_group_id\` int NULL,
                \`category_id\` int NULL,
                \`season_id\` int NULL,
                \`image_url\` text NOT NULL,
                \`brand\` varchar(100) NULL,
                \`style\` varchar(50) NULL,
                \`image_embedding\` longblob NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                INDEX \`idx_cloth_user_lookups\` (\`user_id\`, \`category_id\`, \`color_group_id\`),
                PRIMARY KEY (\`item_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`color_group\` (
                \`color_id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(30) NOT NULL,
                UNIQUE INDEX \`IDX_485978117d19212e4d0d615a90\` (\`name\`),
                PRIMARY KEY (\`color_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`garment_category\` (
                \`category_id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(30) NOT NULL,
                UNIQUE INDEX \`IDX_44e9a77678482e3e60b00b2aba\` (\`name\`),
                PRIMARY KEY (\`category_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`outfit\` (
                \`outfit_id\` varchar(36) NOT NULL,
                \`user_id\` varchar(36) NOT NULL,
                \`folder_id\` varchar(36) NULL,
                \`name\` varchar(100) NULL,
                \`is_favorite\` tinyint NOT NULL DEFAULT 0,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`outfit_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`outfit_folder\` (
                \`folder_id\` varchar(36) NOT NULL,
                \`user_id\` varchar(36) NOT NULL,
                \`name\` varchar(50) NOT NULL,
                UNIQUE INDEX \`IDX_8a1011c24a64f7df062e428542\` (\`user_id\`, \`name\`),
                PRIMARY KEY (\`folder_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`season\` (
                \`season_id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(30) NOT NULL,
                UNIQUE INDEX \`IDX_b3e4a42a8be8b449354a8b31cc\` (\`name\`),
                PRIMARY KEY (\`season_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`user\` (
                \`user_id\` varchar(36) NOT NULL,
                \`username\` varchar(50) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`password_hash\` text NOT NULL,
                \`profile_picture_url\` text NULL,
                \`gender\` varchar(20) NULL,
                \`birthdate\` date NULL,
                \`height_cm\` decimal(5, 2) NULL,
                \`body_type\` varchar(50) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`),
                UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`),
                PRIMARY KEY (\`user_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`outfit_item\` (
                \`outfit_id\` varchar(36) NOT NULL,
                \`item_id\` varchar(36) NOT NULL,
                INDEX \`IDX_4f9708f0239593b69228e9a32b\` (\`outfit_id\`),
                INDEX \`IDX_2c82056d5cf8bdad6ec47d4b03\` (\`item_id\`),
                PRIMARY KEY (\`outfit_id\`, \`item_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`cloth\`
            ADD CONSTRAINT \`FK_918f3ee32a3c549de44570335a3\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`cloth\`
            ADD CONSTRAINT \`FK_a443dbb60c0207ef6b207d18121\` FOREIGN KEY (\`color_group_id\`) REFERENCES \`color_group\`(\`color_id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`cloth\`
            ADD CONSTRAINT \`FK_bc475d1cdc2db05fc7a7bb5cde5\` FOREIGN KEY (\`category_id\`) REFERENCES \`garment_category\`(\`category_id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`cloth\`
            ADD CONSTRAINT \`FK_5b67cd00bedf03c0d852cded4de\` FOREIGN KEY (\`season_id\`) REFERENCES \`season\`(\`season_id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`outfit\`
            ADD CONSTRAINT \`FK_3e59b0bfc9d012d119c0b6aba00\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`outfit\`
            ADD CONSTRAINT \`FK_9f3756ce099785394fd487765d6\` FOREIGN KEY (\`folder_id\`) REFERENCES \`outfit_folder\`(\`folder_id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`outfit_folder\`
            ADD CONSTRAINT \`FK_63a171d006d7b4f0b542552f14f\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`outfit_item\`
            ADD CONSTRAINT \`FK_4f9708f0239593b69228e9a32b1\` FOREIGN KEY (\`outfit_id\`) REFERENCES \`outfit\`(\`outfit_id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`outfit_item\`
            ADD CONSTRAINT \`FK_2c82056d5cf8bdad6ec47d4b03f\` FOREIGN KEY (\`item_id\`) REFERENCES \`cloth\`(\`item_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`outfit_item\` DROP FOREIGN KEY \`FK_2c82056d5cf8bdad6ec47d4b03f\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`outfit_item\` DROP FOREIGN KEY \`FK_4f9708f0239593b69228e9a32b1\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`outfit_folder\` DROP FOREIGN KEY \`FK_63a171d006d7b4f0b542552f14f\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`outfit\` DROP FOREIGN KEY \`FK_9f3756ce099785394fd487765d6\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`outfit\` DROP FOREIGN KEY \`FK_3e59b0bfc9d012d119c0b6aba00\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`cloth\` DROP FOREIGN KEY \`FK_5b67cd00bedf03c0d852cded4de\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`cloth\` DROP FOREIGN KEY \`FK_bc475d1cdc2db05fc7a7bb5cde5\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`cloth\` DROP FOREIGN KEY \`FK_a443dbb60c0207ef6b207d18121\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`cloth\` DROP FOREIGN KEY \`FK_918f3ee32a3c549de44570335a3\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_2c82056d5cf8bdad6ec47d4b03\` ON \`outfit_item\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_4f9708f0239593b69228e9a32b\` ON \`outfit_item\`
        `);
        await queryRunner.query(`
            DROP TABLE \`outfit_item\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\`
        `);
        await queryRunner.query(`
            DROP TABLE \`user\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_b3e4a42a8be8b449354a8b31cc\` ON \`season\`
        `);
        await queryRunner.query(`
            DROP TABLE \`season\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_8a1011c24a64f7df062e428542\` ON \`outfit_folder\`
        `);
        await queryRunner.query(`
            DROP TABLE \`outfit_folder\`
        `);
        await queryRunner.query(`
            DROP TABLE \`outfit\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_44e9a77678482e3e60b00b2aba\` ON \`garment_category\`
        `);
        await queryRunner.query(`
            DROP TABLE \`garment_category\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_485978117d19212e4d0d615a90\` ON \`color_group\`
        `);
        await queryRunner.query(`
            DROP TABLE \`color_group\`
        `);
        await queryRunner.query(`
            DROP INDEX \`idx_cloth_user_lookups\` ON \`cloth\`
        `);
        await queryRunner.query(`
            DROP TABLE \`cloth\`
        `);
    }

}
