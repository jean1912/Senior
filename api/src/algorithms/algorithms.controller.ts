import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AlgorithmsService } from './algorithms.service';
import { CreateAlgorithmDto } from './dto/create-algorithm.dto';
import { UpdateAlgorithmDto } from './dto/update-algorithm.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('algorithms')
export class AlgorithmsController {
  constructor(private readonly algorithmsService: AlgorithmsService) {}

  
  @Get()
  findAll() {
    return this.algorithmsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.algorithmsService.findOne(id);
  }

  
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateAlgorithmDto, @Req() req) {
    return this.algorithmsService.create(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAlgorithmDto,
    @Req() req,
  ) {
    return this.algorithmsService.update(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.algorithmsService.remove(id);
  }
}
