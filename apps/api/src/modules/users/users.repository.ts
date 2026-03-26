import { Injectable } from '@nestjs/common';
import { Language } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUuid(uuid: string) {
    return this.prisma.user.findUnique({ where: { uuid } });
  }

  async findById(id: bigint) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateProfile(
    id: bigint,
    data: {
      name?: string;
      phone?: string;
      email?: string;
      langPref?: Language;
    },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  // ─── Addresses ──────────────────────────────────────

  async findAddresses(userId: bigint) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findAddressById(id: bigint, userId: bigint) {
    return this.prisma.address.findFirst({
      where: { id, userId },
    });
  }

  async createAddress(
    userId: bigint,
    data: {
      label?: string;
      address: string;
      city: string;
      isDefault?: boolean;
    },
  ) {
    if (data.isDefault) {
      await this.clearDefaultAddress(userId);
    }

    return this.prisma.address.create({
      data: { ...data, userId },
    });
  }

  async updateAddress(
    id: bigint,
    userId: bigint,
    data: {
      label?: string;
      address?: string;
      city?: string;
      isDefault?: boolean;
    },
  ) {
    if (data.isDefault) {
      await this.clearDefaultAddress(userId);
    }

    return this.prisma.address.updateMany({
      where: { id, userId },
      data,
    });
  }

  async deleteAddress(id: bigint, userId: bigint) {
    return this.prisma.address.deleteMany({
      where: { id, userId },
    });
  }

  private async clearDefaultAddress(userId: bigint) {
    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }
}
