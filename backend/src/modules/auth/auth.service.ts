// auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/user.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from './entities/auth.entity'
import { ConfigService } from '@nestjs/config'; 

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService, 
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    console.log('User from DB:', user);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async login(user: any) {
    const tokens = await this._getTokens(user.id, user.name);
    await this._saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: number) {

    await this.authRepository.delete({ user: { id: userId } });
  }


  async refresh(userId: number, refreshToken: string) {

    const user = await this.usersService.findOne(userId);

    const isTokenValid = await this._validateRefreshToken(userId, refreshToken);

    if (!user || !isTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    
    const tokens = await this._getTokens(user.id, user.name);

    await this._saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }
  
  private async _saveRefreshToken(userId: number, token: string) {
    const hashedToken = await bcrypt.hash(token, 10);

    await this.authRepository.delete({ user: { id: userId } });
    
    const newRefreshToken = this.authRepository.create({
      token: hashedToken,
      user: { id: userId } as User, 
    });
    
    await this.authRepository.save(newRefreshToken);
  }

  private async _validateRefreshToken(userId: number, token: string): Promise<boolean> {
      const savedToken = await this.authRepository.findOne({
          where: { user: { id: userId } }
      });

      if (!savedToken) {
          return false;
      }

      return bcrypt.compare(token, savedToken.token);
  }

  private async _getTokens(userId: number, name: string) {
    const payload = { sub: userId, name };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.secret'),          
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}