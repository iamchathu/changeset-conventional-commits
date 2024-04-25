// [GitHub > changesets > changesets/packages/cli/src/commands/add/isListablePackage.ts](https://github.com/changesets/changesets/blob/main/packages/cli/src/commands/add/isListablePackage.ts)
// DODO: Return better/verbose info from `isListablePackage()`!
import { Config } from '@changesets/types';
import { PackageJSON } from '@changesets/types';

export function isListablePackage(config: Config, packageJson: PackageJSON) {
  const packageIgnoredInConfig = config.ignore.includes(packageJson.name);

  if (packageIgnoredInConfig) {
    return false;
  }

  if (!config.privatePackages.version && packageJson.private) {
    return false;
  }

  const hasVersionField = !!packageJson.version;
  return hasVersionField;
}
