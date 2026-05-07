import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1776367648999 implements MigrationInterface {
    name = 'InitialSchema1776367648999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`clothing_item\` (
                \`id\` varchar(36) NOT NULL,
                \`user_id\` varchar(36) NOT NULL,
                \`color_group_id\` int NULL,
                \`category_id\` int NULL,
                \`season_id\` int NULL,
                \`image_id\` char(36) NOT NULL,
                \`style\` varchar(255) NULL,
                \`image_embedding\` longblob NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                INDEX \`idx_clothing_item_user_lookups\` (\`user_id\`, \`category_id\`, \`color_group_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`color_group\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_485978117d19212e4d0d615a90\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`garment_category\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_44e9a77678482e3e60b00b2aba\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`gender\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_715cef762c43bdc30e83bea161\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`outfit\` (
                \`id\` varchar(36) NOT NULL,
                \`user_id\` varchar(36) NOT NULL,
                \`folder_id\` varchar(36) NULL,
                \`name\` varchar(255) NULL,
                \`is_favorite\` tinyint NOT NULL DEFAULT 0,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`outfit_folder\` (
                \`id\` varchar(36) NOT NULL,
                \`user_id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_8a1011c24a64f7df062e428542\` (\`user_id\`, \`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`season\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_b3e4a42a8be8b449354a8b31cc\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`user\` (
                \`id\` varchar(36) NOT NULL,
                \`username\` varchar(255) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`password_hash\` text NOT NULL,
                \`profile_picture_url\` text NULL,
                \`gender_id\` int NULL,
                \`birthdate\` date NULL,
                \`height_cm\` decimal(5, 2) NULL,
                \`body_type\` varchar(255) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`),
                UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`),
                PRIMARY KEY (\`id\`)
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
            CREATE TABLE \`image\` (
                \`id\`            varchar(36)  NOT NULL,
                \`data\`          longblob     NOT NULL,
                \`mime_type\`     varchar(50)  NOT NULL,
                \`original_name\` varchar(255) NOT NULL,
                \`size\`          int          NOT NULL,
                \`created_at\`    datetime(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`body_mapping\` (
                \`id\`            varchar(36)   NOT NULL,
                \`user_id\`       char(36)      NOT NULL,
                \`image_id\`      char(36)      NOT NULL,
                \`picture\`       varchar(500)  NULL     DEFAULT NULL,
                \`height_cm\`     decimal(5, 2) NULL     DEFAULT NULL,
                \`weight_kg\`     decimal(5, 2) NULL     DEFAULT NULL,
                \`body_type\`     varchar(100)  NULL     DEFAULT NULL,
                \`created_at\`    datetime(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`uq_body_mapping_user\` (\`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`clothing_item\`
            ADD CONSTRAINT \`FK_clothing_item_image\` FOREIGN KEY (\`image_id\`) REFERENCES \`image\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`clothing_item\`
            ADD CONSTRAINT \`FK_40ffd7032b3aaca46037385f4cd\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`body_mapping\`
            ADD CONSTRAINT \`FK_body_mapping_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`body_mapping\`
            ADD CONSTRAINT \`FK_body_mapping_image\` FOREIGN KEY (\`image_id\`) REFERENCES \`image\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`clothing_item\`
            ADD CONSTRAINT \`FK_cd93050251e6d2fa0eefae9c0f1\` FOREIGN KEY (\`color_group_id\`) REFERENCES \`color_group\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`clothing_item\`
            ADD CONSTRAINT \`FK_2aa439c3a7ba235859cf9c32d8f\` FOREIGN KEY (\`category_id\`) REFERENCES \`garment_category\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`clothing_item\`
            ADD CONSTRAINT \`FK_c6457c0285595071e5fb841c294\` FOREIGN KEY (\`season_id\`) REFERENCES \`season\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`outfit\`
            ADD CONSTRAINT \`FK_3e59b0bfc9d012d119c0b6aba00\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`outfit\`
            ADD CONSTRAINT \`FK_9f3756ce099785394fd487765d6\` FOREIGN KEY (\`folder_id\`) REFERENCES \`outfit_folder\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`outfit_folder\`
            ADD CONSTRAINT \`FK_63a171d006d7b4f0b542552f14f\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD CONSTRAINT \`FK_6d4390ab1c0e8c86287d9f4c430\` FOREIGN KEY (\`gender_id\`) REFERENCES \`gender\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`outfit_item\`
            ADD CONSTRAINT \`FK_4f9708f0239593b69228e9a32b1\` FOREIGN KEY (\`outfit_id\`) REFERENCES \`outfit\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`outfit_item\`
            ADD CONSTRAINT \`FK_2c82056d5cf8bdad6ec47d4b03f\` FOREIGN KEY (\`item_id\`) REFERENCES \`clothing_item\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_6d4390ab1c0e8c86287d9f4c430\`
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
            ALTER TABLE \`clothing_item\` DROP FOREIGN KEY \`FK_c6457c0285595071e5fb841c294\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`clothing_item\` DROP FOREIGN KEY \`FK_2aa439c3a7ba235859cf9c32d8f\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`clothing_item\` DROP FOREIGN KEY \`FK_cd93050251e6d2fa0eefae9c0f1\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`clothing_item\` DROP FOREIGN KEY \`FK_clothing_item_image\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`clothing_item\` DROP FOREIGN KEY \`FK_40ffd7032b3aaca46037385f4cd\`
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
            DROP INDEX \`IDX_715cef762c43bdc30e83bea161\` ON \`gender\`
        `);
        await queryRunner.query(`
            DROP TABLE \`gender\`
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
            DROP INDEX \`idx_clothing_item_user_lookups\` ON \`clothing_item\`
        `);
        await queryRunner.query(`
            DROP TABLE \`clothing_item\`
        `);
        await queryRunner.query(`DROP TABLE \`image\``);
        await queryRunner.query(`ALTER TABLE \`body_mapping\` DROP FOREIGN KEY \`FK_body_mapping_image\``);
        await queryRunner.query(`ALTER TABLE \`body_mapping\` DROP FOREIGN KEY \`FK_body_mapping_user\``);
        await queryRunner.query(`DROP INDEX \`uq_body_mapping_user\` ON \`body_mapping\``);
        await queryRunner.query(`DROP TABLE \`body_mapping\``);
    }

}
