import { SetMetadata } from '@nestjs/common';
import { IS_DEVICE_KEY } from '../guards/device-token.guard';

export const DeviceAuth = () => SetMetadata(IS_DEVICE_KEY, true);
