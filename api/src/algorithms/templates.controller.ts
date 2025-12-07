import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TemplatesService } from './templates.service';

@Controller('algorithm-templates')
export class TemplatesController {
  constructor(private readonly templates: TemplatesService) {}

  @Get()
  findAll() {
    return this.templates.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.templates.findOne(id);
  }
}
