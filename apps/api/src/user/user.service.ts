import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@repo/database';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany({
    where,
    select,
  }: {
    where?: Prisma.UserWhereInput;
    select?: Prisma.UserSelect;
  }): Promise<User[]> {
    return await this.prisma.user.findMany({
      where: where ? { ...where } : undefined,
      select: select ? { ...select } : undefined,
    });
  }

  async findFirst({
    where,
    select,
  }: {
    where: Prisma.UserWhereInput;
    select?: Prisma.UserSelect;
  }) {
    return await this.prisma.user.findFirst({
      where: { ...where },
      select: select ? { ...select } : undefined,
    });
  }

  async findUnique({
    where,
    select,
  }: {
    where: Prisma.UserWhereUniqueInput;
    select?: Prisma.UserSelect;
  }) {
    return await this.prisma.user.findUnique({
      where: { ...where },
      select: select ? { ...select } : undefined,
    });
  }

  async createUser({ create }: { create: Prisma.UserCreateInput }) {
    return await this.prisma.user.create({
      data: { ...create },
    });
  }

  async updateUser({
    update,
    where,
  }: {
    where: Prisma.UserWhereUniqueInput;
    update: Prisma.UserUpdateInput;
  }) {
    return await this.prisma.user.update({
      where: { ...where },
      data: { ...update },
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput) {
    return await this.prisma.user.delete({
      where: { ...where },
    });
  }
}
