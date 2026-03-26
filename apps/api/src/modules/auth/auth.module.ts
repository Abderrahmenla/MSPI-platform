import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { DatabaseModule } from '../../database/database.module';
import { AuthService } from './auth.service';
import { FacebookAuthController } from './facebook-auth.controller';
import { AdminAuthController } from './admin-auth.controller';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { CustomerJwtStrategy } from './strategies/customer-jwt.strategy';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';

@Module({
  imports: [PassportModule, JwtModule.register({}), DatabaseModule],
  controllers: [FacebookAuthController, AdminAuthController],
  providers: [
    AuthService,
    FacebookStrategy,
    CustomerJwtStrategy,
    AdminJwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
