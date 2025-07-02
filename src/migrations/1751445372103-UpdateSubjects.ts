import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSubjects1751445372103 implements MigrationInterface {
    name = 'UpdateSubjects1751445372103'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subjects" DROP CONSTRAINT "FK_b3530fb0011047d8af477cff082"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "marks"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "totalMarks"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."subjects_status_enum"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "resultId"`);
        await queryRunner.query(`ALTER TABLE "subjects" DROP COLUMN "grade"`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD CONSTRAINT "UQ_542cbba74dde3c82ab49c573109" UNIQUE ("code")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subjects" DROP CONSTRAINT "UQ_542cbba74dde3c82ab49c573109"`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "grade" character varying(5) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "resultId" uuid`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`CREATE TYPE "public"."subjects_status_enum" AS ENUM('PASS', 'FAIL')`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "status" "public"."subjects_status_enum" NOT NULL DEFAULT 'PASS'`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "totalMarks" numeric(5,2) NOT NULL DEFAULT '100'`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD "marks" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "subjects" ADD CONSTRAINT "FK_b3530fb0011047d8af477cff082" FOREIGN KEY ("resultId") REFERENCES "results"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
