import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  private readonly PAGE_SIZE = 10;

  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    category?: string;
    search?: string;
  }) {
    const page = params.page || 1;
    const skip = (page - 1) * this.PAGE_SIZE;

    const where: any = {};

    if (params.category) {
      where.category = params.category;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search } },
        { description: { contains: params.search } },
        { location: { contains: params.search } },
      ];
    }

    return this.prisma.event.findMany({
      where,
      skip,
      take: this.PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async saveEvent(userId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.savedEvent.upsert({
      where: {
        userId_eventId: { userId, eventId },
      },
      update: {},
      create: { userId, eventId },
    });
  }

  async unsaveEvent(userId: string, eventId: string) {
    return this.prisma.savedEvent.deleteMany({
      where: { userId, eventId },
    });
  }

  async getSavedEvents(userId: string) {
    const savedEvents = await this.prisma.savedEvent.findMany({
      where: { userId },
      include: { event: true },
    });
    return savedEvents.map((se) => se.event);
  }
}
