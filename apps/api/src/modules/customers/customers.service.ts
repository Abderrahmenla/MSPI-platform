import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomersRepository } from './customers.repository';
import { ListCustomersDto } from './dto/list-customers.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly customersRepo: CustomersRepository) {}

  async list(dto: ListCustomersDto) {
    return this.customersRepo.findAll({
      page: dto.page ?? 1,
      limit: dto.limit ?? 20,
      search: dto.search,
    });
  }

  async getByUuid(uuid: string) {
    const customer = await this.customersRepo.findByUuid(uuid);
    if (!customer) throw new NotFoundException('Customer not found');
    return { data: customer };
  }
}
