import { IsString, IsOptional, IsIn, MaxLength, IsBoolean } from 'class-validator';

export class CreateAlgorithmDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsIn(['Sorting', 'Searching', 'Graph', 'Tree', 'Dynamic', 'Greedy', 'Other'])
  category: string;

  @IsString()
  @MaxLength(50)
  complexity: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  pseudocode?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  structureSchema?: Record<string, any>;

  @IsOptional()
  validationRules?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
