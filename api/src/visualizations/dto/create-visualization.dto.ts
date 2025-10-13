import { IsString, IsOptional, IsNumber, IsJSON } from 'class-validator';

export class CreateVisualizationDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  structureType: string;

  @IsOptional()
  @IsJSON()
  stateJson?: any;

  @IsNumber()
  algorithmId: number;
}
