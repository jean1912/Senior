import { Controller, Post, Get, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('algorithm-blocks')
@UseGuards(JwtAuthGuard)
export class BlocksController {
  constructor(private readonly blocks: BlocksService) {}

  @Post()
  create(@Body() dto: CreateBlockDto) {
    return this.blocks.create(dto);
  }

  @Get('by-algorithm/:algorithmId')
  findByAlgorithm(@Param('algorithmId', ParseIntPipe) algorithmId: number) {
    return this.blocks.findByAlgorithm(algorithmId);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBlockDto) {
    return this.blocks.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.blocks.remove(id);
  }
}
