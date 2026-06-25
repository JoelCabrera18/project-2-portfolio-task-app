import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateSettingsUseCase } from '../classes/update-settings.class';
import { UpdateSettingsDto } from '../dto/update-settings.dto';
import { UserSettings, DEFAULT_SETTINGS } from '../interfaces/settings.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from 'src/auth/entities/auth.entity';
import { Profile } from '../entities/profile.entity';

@Injectable()
export class UpdateSettingsUseCaseImp extends UpdateSettingsUseCase {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userRepo: Repository<UserProfile>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
  ) {
    super();
  }

  async execute(userCode: string, dto: UpdateSettingsDto): Promise<UserSettings> {
    const user = await this.userRepo.findOne({
      where: { code: userCode },
      relations: { profile: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const current = user.profile.settings ?? {};
    const merged = deepMerge(current, dto as unknown as Record<string, unknown>);

    user.profile.settings = merged;
    await this.profileRepo.save(user.profile);

    return deepMerge(DEFAULT_SETTINGS as unknown as Record<string, unknown>, merged) as unknown as UserSettings;
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
