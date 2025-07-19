import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MemberShipTier } from '@repo/database';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TierAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTiers = this.reflector.getAllAndOverride<MemberShipTier[]>(
      'tiers',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredTiers) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.id) {
      return false;
    }
    const currentUser = await this.userService.findUnique({
      where: { id: user.id },
    });
    if (!currentUser || !currentUser.tier) {
      return false;
    }
    return requiredTiers.includes(currentUser.tier);
  }
}
