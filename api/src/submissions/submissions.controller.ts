import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateSubmissionDto, @Req() req) {
    return this.submissionsService.create(dto, req.user.userId);
  }

  // 🔥 NEW: LeetCode-style judge
  @UseGuards(JwtAuthGuard)
  @Post('grade')
  grade(@Body() dto: GradeSubmissionDto, @Req() req) {
    return this.submissionsService.grade(dto, req.user.userId);
  }

  @Get()
  findAll(@Query('query') query?: string) {
    return this.submissionsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.submissionsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubmissionDto,
    @Req() req,
  ) {
    return this.submissionsService.update(id, dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.submissionsService.remove(id, req.user.userId);
  }
}
