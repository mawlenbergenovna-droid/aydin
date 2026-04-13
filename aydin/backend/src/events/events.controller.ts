import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.eventsService.findAll({
      page: page ? parseInt(page, 10) : 1,
      category,
      search,
    });
  }

  @Get('saved')
  async getSavedEvents(@Request() req) {
    return this.eventsService.getSavedEvents(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post('save')
  async saveEvent(@Request() req, @Body() body: { eventId: string }) {
    return this.eventsService.saveEvent(req.user.id, body.eventId);
  }

  @Delete('save/:eventId')
  async unsaveEvent(@Request() req, @Param('eventId') eventId: string) {
    return this.eventsService.unsaveEvent(req.user.id, eventId);
  }
}
