import { UpdateLockedConfig } from '../../../types';
import * as packageLock1 from './package-lock';

export function updateLockedDependency(
  config: UpdateLockedConfig
): Promise<Record<string, string>> {
  return packageLock1.updateLockedDependency(config);
}
