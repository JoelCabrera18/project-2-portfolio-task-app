import { UpdateSettingsDto } from '../dto/update-settings.dto';
import { UserSettings } from '../interfaces/settings.interface';

export abstract class UpdateSettingsUseCase {
  abstract execute(userCode: string, dto: UpdateSettingsDto): Promise<UserSettings>;
}
