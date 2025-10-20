import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Request,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { VisualizationService } from './visualization.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateVisualizationDto } from './dto/create-visualization.dto';
import { UpdateVisualizationDto } from './dto/update-visualization.dto';

@Controller('visualizations')
export class VisualizationController {
  constructor(private readonly visService: VisualizationService) {}

  // 🧱 Create static visualization
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateVisualizationDto, @Request() req) {
    return this.visService.create(dto, req.user.sub);
  }

  // 📋 Get all
  @Get()
  findAll() {
    return this.visService.findAll();
  }

  // 🔍 Get one
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.visService.findOne(id);
  }

  // ✏️ Update
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVisualizationDto,
  ) {
    return this.visService.update(id, dto);
  }

  // ❌ Delete
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.visService.remove(id);
  }

  // ⚙️ Dynamic generation — NO AUTH (for now)
  @Post('generate')
  async generateDynamic(@Body() body: { algorithmId: number; input: any }) {
    return this.visService.generateDynamic(body.algorithmId, body.input);
  }
}
