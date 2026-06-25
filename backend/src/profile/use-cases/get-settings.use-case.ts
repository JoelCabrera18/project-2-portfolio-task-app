import { Injectable, NotFoundException } from '@nestjs/common';
import { GetSettingsUseCase } from '../classes/get-settings.class';
import { UserSettings, DEFAULT_SETTINGS } from '../interfaces/settings.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from 'src/auth/entities/auth.entity';

@Injectable()
export class GetSettingsUseCaseImp extends GetSettingsUseCase {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userRepo: Repository<UserProfile>,
  ) {
    super();
  }

  async execute(userCode: string): Promise<UserSettings> {
    const user = await this.userRepo.findOne({
      where: { code: userCode },
      relations: { profile: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const saved = user.profile.settings as Record<string, unknown> | undefined;
    return deepMerge(DEFAULT_SETTINGS as unknown as Record<string, unknown>, saved ?? {}) as unknown as UserSettings;
  }
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
}
