import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GradeSubmissionDto {
  @IsInt()
  @IsNotEmpty()
  exerciseId: number;

  // full JavaScript source (must define function main(input) { ... })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  code: string;
}
