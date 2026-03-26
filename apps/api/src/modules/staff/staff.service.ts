import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { StaffRepository } from './staff.repository';
import { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class StaffService {
  constructor(private readonly staffRepo: StaffRepository) {}

  async list() {
    return { data: await this.staffRepo.findAll() };
  }

  async getById(id: bigint) {
    const admin = await this.staffRepo.findById(id);
    if (!admin) throw new NotFoundException('Staff member not found');
    return { data: admin };
  }

  async create(dto: CreateStaffDto) {
    const existing = await this.staffRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const admin = await this.staffRepo.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role,
    });

    return { data: admin };
  }

  async deactivate(id: bigint) {
    await this.getById(id);
    const admin = await this.staffRepo.updateActive(id, false);
    return { data: admin };
  }

  async reactivate(id: bigint) {
    await this.getById(id);
    const admin = await this.staffRepo.updateActive(id, true);
    return { data: admin };
  }
}
