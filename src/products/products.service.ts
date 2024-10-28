import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to the database');
  }

  async create(dto: CreateProductDto) {
    return await this.product.create({
      data: dto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const total = await this.product.count();
    const totalPages = Math.ceil(total / limit);

    const list = await this.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      metadata: {
        page,
        total,
        totalPages,
      },
      data: list,
    };
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: { id, available: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    const { id: __, ...data } = dto;
    await this.findOne(id);
    // Update
    await this.product.update({
      where: { id },
      data: data,
    });

    return await this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    const product = await this.product.update({
      where: { id },
      data: { available: false },
    });
    //await this.product.delete({
    //  where: { id },
    //});
    return product;
  }
}
