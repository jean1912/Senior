import { IsString, IsOptional, IsInt, Min, IsObject } from 'class-validator';

export class CreateBlockDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @IsOptional()
  @IsString()
  codeSnippet?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsInt()
  algorithmId: number;
}
