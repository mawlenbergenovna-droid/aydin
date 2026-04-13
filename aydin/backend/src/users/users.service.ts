import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      interests: JSON.parse(user.interests),
    };
  }

  async update(id: string, data: { interests?: string[] }) {
    const updateData: any = {};
    if (data.interests) {
      updateData.interests = JSON.stringify(data.interests);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return {
      id: user.id,
      email: user.email,
      interests: JSON.parse(user.interests),
    };
  }
}
