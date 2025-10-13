import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { VisualizationService } from './visualization.service';
import { CreateVisualizationDto } from './dto/create-visualization.dto';
import { UpdateVisualizationDto } from './dto/update-visualization.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('visualizations')
export class VisualizationController {
  constructor(private readonly visualizationService: VisualizationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateVisualizationDto, @Request() req) {
    return this.visualizationService.create(dto, req.user.sub);
  }

  @Get()
  findAll() {
    return this.visualizationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.visualizationService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVisualizationDto) {
    return this.visualizationService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.visualizationService.remove(id);
  }
}
