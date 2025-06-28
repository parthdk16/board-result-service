// schemas/result.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ResultDocument = Result & Document;

@Schema()
export class Subject {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true, min: 0, max: 100 })
  marks: number;

  @Prop({ required: true, min: 0, max: 100 })
  totalMarks: number;

  @Prop({ required: true })
  grade: string;

  @Prop({ default: 'PASS', enum: ['PASS', 'FAIL'] })
  status: string;
}

@Schema({ timestamps: true })
export class Result {
  @Prop({ required: true })
  studentId: string; // Reference to User ID

  @Prop({ required: true })
  studentName: string;

  @Prop({ required: true })
  studentRegNo: string; // Student Registration/Roll Number

  @Prop({ required: true })
  semester: number;

  @Prop({ required: true })
  academicYear: string; // e.g., "2023-24"

  @Prop({ required: true })
  course: string; // e.g., "B.Tech Computer Science"

  @Prop({ type: [Subject], required: true })
  subjects: Subject[];

  @Prop({ required: true, min: 0 })
  totalMarks: number;

  @Prop({ required: true, min: 0 })
  obtainedMarks: number;

  @Prop({ required: true, min: 0, max: 100 })
  percentage: number;

  @Prop({ required: true })
  cgpa: number;

  @Prop({ required: true })
  overallGrade: string;

  @Prop({ default: 'PASS', enum: ['PASS', 'FAIL', 'DETAINED'] })
  overallStatus: string;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop()
  publishedAt: Date;

  @Prop({ required: true })
  publishedBy: string; // Moderator ID who published the result

  @Prop()
  remarks: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ResultSchema = SchemaFactory.createForClass(Result);

// Add indexes for better query performance
ResultSchema.index({ studentId: 1 });
ResultSchema.index({ studentRegNo: 1 });
ResultSchema.index({ semester: 1, academicYear: 1 });
ResultSchema.index({ isPublished: 1 });
ResultSchema.index({ createdAt: -1 });
