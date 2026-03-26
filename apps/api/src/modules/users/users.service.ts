import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';

import { UsersRepository } from './users.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getProfile(user: User) {
    return {
      uuid: user.uuid,
      name: user.name,
      phone: user.phone,
      email: user.email,
      langPref: user.langPref,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(user: User, dto: UpdateProfileDto) {
    const updated = await this.usersRepository.updateProfile(user.id, dto);
    return {
      uuid: updated.uuid,
      name: updated.name,
      phone: updated.phone,
      email: updated.email,
      langPref: updated.langPref,
    };
  }

  // ─── Addresses ──────────────────────────────────────

  async getAddresses(user: User) {
    return this.usersRepository.findAddresses(user.id);
  }

  async createAddress(user: User, dto: CreateAddressDto) {
    return this.usersRepository.createAddress(user.id, dto);
  }

  async updateAddress(user: User, addressId: bigint, dto: UpdateAddressDto) {
    const address = await this.usersRepository.findAddressById(
      addressId,
      user.id,
    );

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.usersRepository.updateAddress(addressId, user.id, dto);

    return this.usersRepository.findAddressById(addressId, user.id);
  }

  async deleteAddress(user: User, addressId: bigint) {
    const address = await this.usersRepository.findAddressById(
      addressId,
      user.id,
    );

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.usersRepository.deleteAddress(addressId, user.id);

    return { deleted: true };
  }
}
