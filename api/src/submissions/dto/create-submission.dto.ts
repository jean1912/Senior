import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSubmissionDto {
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  content?: string;
}
