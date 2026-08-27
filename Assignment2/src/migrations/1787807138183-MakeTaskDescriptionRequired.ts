import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeTaskDescriptionRequired1787807138183 implements MigrationInterface {
    name = 'MakeTaskDescriptionRequired1787807138183'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "description" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ALTER COLUMN "description" DROP NOT NULL`);
    }

}
