import { Injectable } from '@nestjs/common';
import { AdminRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class StaffRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: bigint) {
    return this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.admin.findUnique({ where: { email } });
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    role?: AdminRole;
  }) {
    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    return this.prisma.admin.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role ?? AdminRole.VIEWER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
  }

  async updateActive(id: bigint, active: boolean) {
    return this.prisma.admin.update({
      where: { id },
      data: { active },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
  }
}
