import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, UpdateResult, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CacheService } from '../../shared/cache/cache.service'; 
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    private readonly cacheService: CacheService,
  ) {}

async create(data: CreateProductDto): Promise<Product> {
  try {
    const product = this.repo.create(data);
    const saved = await this.repo.save(product);

    await this.cacheService.del('products:all');          
    await this.cacheService.set(`products:${saved.id}`, saved);  

    return saved;
  } catch (error) {
    if (error instanceof QueryFailedError && error.driverError?.code === 'ER_DUP_ENTRY') {
      throw new ConflictException(`Product with name '${data.name}' already exists.`);
    }
    throw error;
  }
}


  async findAll(): Promise<Product[]> {
    const cacheKey = 'products:all';
    const cached = await this.cacheService.get<Product[]>(cacheKey);
    if (cached) return cached;

    const list = await this.repo.find();
    await this.cacheService.set(cacheKey, list);
    return list;
  }

  async findOne(id: number): Promise<Product | null> {
    const key = `products:${id}`;
    const cached = await this.cacheService.get<Product>(key);
    if (cached) {
      return cached;
    }

    const product = await this.repo.findOne({ where: { id } });
    if (product) {
      await this.cacheService.set(key, product); 
    }

    return product;
  }

  async update(id: number, data: UpdateProductDto): Promise<Product | null> {
    await this.repo.update(id, data);
    const updatedProduct = await this.findOne(id);

    if (updatedProduct) {
      await this.cacheService.del('products:all');
      await this.cacheService.set(`products:${id}`, updatedProduct);      
    }

    return updatedProduct;
  }


  async remove(id: number): Promise<UpdateResult> {
    const result = await this.repo.softDelete(id);

    if (result.affected && result.affected > 0) {
      // ล้าง cache ตามเดิม
      await this.cacheService.del('products:all');
      await this.cacheService.del(`products:${id}`);
    }

    return result;
  }

}