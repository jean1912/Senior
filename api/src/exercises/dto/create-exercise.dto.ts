import { IsOptional, IsString, MaxLength, IsInt } from 'class-validator';

export class CreateExerciseDto {
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;

  @IsInt()
  algorithmId: number;

  // ========= NEW FIELDS ================

  // visible examples shown to student (array of { input, output })
  @IsOptional()
  visibleTestCases?: any;

  // hidden tests used only by judge
  @IsOptional()
  hiddenTestCases?: any;

  // function signature contract — e.g. "function main(input) { ... }"
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  functionSignature?: string;

  // starter JS code template
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  starterCode?: string;
}
