import { loadFixture } from '../../../../../test/util';
import * as npmUpdater from '.';

const readFixture = (x: string): string => loadFixture(x, '../..');

const input01Content = readFixture('inputs/01.json');
const input01GlobContent = readFixture('inputs/01-glob.json');
const input01PMContent = readFixture('inputs/01-package-manager.json');

describe('manager/npm/update/dependency/index', () => {
  describe('.updateDependency(fileContent, depType, depName, newValue)', () => {
    it('replaces a dependency value', () => {
      const upgrade = {
        depType: 'dependencies',
        depName: 'cheerio',
        newValue: '0.22.1',
      };
      const outputContent = readFixture('outputs/011.json');
      const testContent = npmUpdater.updateDependency({
        fileContent: input01Content,
        upgrade,
      });
      expect(testContent).toEqual(outputContent);
    });
    it('replaces a github dependency value', () => {
      const upgrade = {
        depType: 'dependencies',
        depName: 'gulp',
        currentValue: 'v4.0.0-alpha.2',
        currentRawValue: 'gulpjs/gulp#v4.0.0-alpha.2',
        newValue: 'v4.0.0',
      };
      const input = JSON.stringify({
        dependencies: {
          gulp: 'gulpjs/gulp#v4.0.0-alpha.2',
        },
      });
      const res = npmUpdater.updateDependency({
        fileContent: input,
        upgrade,
      });
      // FIXME: explicit assert condition
      expect(res).toMatchSnapshot();
    });
    it('replaces a npm package alias', () => {
      const upgrade = {
        depType: 'dependencies',
        depName: 'hapi',
        npmPackageAlias: true,
        lookupName: '@hapi/hapi',
        currentValue: '18.3.0',
        newValue: '18.3.1',
      };
      const input = JSON.stringify({
        dependencies: {
          hapi: 'npm:@hapi/hapi@18.3.0',
        },
      });
      const res = npmUpdater.updateDependency({
        fileContent: input,
        upgrade,
      });
      // FIXME: explicit assert condition
      expect(res).toMatchSnapshot();
    });
    it('replaces a github short hash', () => {
      const upgrade = {
        depType: 'dependencies',
        depName: 'gulp',
        currentDigest: 'abcdef7',
        currentRawValue: 'gulpjs/gulp#abcdef7',
        newDigest: '0000000000111111111122222222223333333333',
      };
      const input = JSON.stringify({
        dependencies: {
          gulp: 'gulpjs/gulp#abcdef7',
        },
      });
      const res = npmUpdater.updateDependency({
        fileContent: input,
        upgrade,
      });
      // FIXME: explicit assert condition
      expect(res).toMatchSnapshot();
    });
    it('replaces a github fully specified version', () => {
      const upgrade = {
        depType: 'dependencies',
        depName: 'n',
        currentValue: 'v1.0.0',
        currentRawValue: 'git+https://github.com/owner/n#v1.0.0',
        newValue: 'v1.1.0',
      };
      const input = JSON.stringify({
        dependencies: {
          n: 'git+https://github.com/owner/n#v1.0.0',
        },
      });
      const res = npmUpdater.updateDependency({
        fileContent: input,
        upgrade,
      });
      expect(res).toMatchSnapshot();
      expect(res).toContain('v1.1.0');
    });
    it('updates resolutions too', () => {
      const upgrade = {
        depType: 'dependencies',
        depName: 'config',
        newValue: '1.22.0',
      };
      const testContent = npmUpdater.updateDependency({
        fileContent: input01Content,
        upgrade,
      });
      expect(JSON.parse(testContent).dependencies.config).toBe('1.22.0');
      expect(JSON.parse(testContent).resolutions.config).toBe('1.22.0');
    });
    it('updates glob resolutions', () => {
      const upgrade = {
        depType: 'dependencies',
        depName: 'config',
        newValue: '1.22.0',
      };
      const testContent = npmUpdater.updateDependency({
        fileContent: input01GlobContent,
        upgrade,
      });
      expect(JSON.parse(testContent).dependencies.config).toBe('1.22.0');
      expect(JSON.parse(testContent).resolutions['**/config']).toBe('1.22.0');
    });
    it('updates glob resolutions without dep', () => {
      const upgrade = {
        depType: 'resolutions',
        depName: '@angular/cli',
        managerData: { key: '**/@angular/cli' },
        newValue: '8.1.0',
      };
      const testContent = npmUpdater.updateDependency({
        fileContent: input01Content,
        upgrade,
      });
      expect(JSON.parse(testContent).resolutions['**/@angular/cli']).toBe(
        '8.1.0'
      );
    });
    it('replaces only the first instance of a value', () => {
      const upgrade = {
        depType: 'devDependencies',
        depName: 'angular-touch',
        newValue: '1.6.1',
      };
      const outputContent = readFixture('outputs/012.json');
      const testContent = npmUpdater.updateDependency({
        fileContent: input01Content,
        upgrade,
      });
      expect(testContent).toEqual(outputContent);
    });
    it('replaces only the second instance of a value', () => {
      const upgrade = {
        depType: 'devDependencies',
        depName: 'angular-sanitize',
        newValue: '1.6.1',
      };
      const outputContent = readFixture('outputs/013.json');
      const testContent = npmUpdater.updateDependency({
        fileContent: input01Content,
        upgrade,
      });
      expect(testContent).toEqual(outputContent);
    });
    it('handles the case where the desired version is already supported', () => {
      const upgrade = {
        depType: 'devDependencies',
        depName: 'angular-touch',
        newValue: '1.5.8',
      };
      const testContent = npmUpdater.updateDependency({
        fileContent: input01Content,
        upgrade,
      });
      expect(testContent).toEqual(input01Content);
    });
    it('returns null if throws error', () => {
      const upgrade = {
        depType: 'blah',
        depName: 'angular-touch-not',
        newValue: '1.5.8',
      };
      const testContent = npmUpdater.updateDependency({
        fileContent: input01Content,
        upgrade,
      });
      expect(testContent).toBeNull();
    });

    it('updates packageManager', () => {
      const upgrade = {
        depType: 'packageManager',
        depName: 'yarn',
        newValue: '3.1.0',
      };
      const outputContent = readFixture('outputs/014.json');
      const testContent = npmUpdater.updateDependency({
        fileContent: input01PMContent,
        upgrade,
      });
      expect(testContent).toEqual(outputContent);
    });

    it('returns null if empty file', () => {
      const upgrade = {
        depType: 'dependencies',
        depName: 'angular-touch-not',
        newValue: '1.5.8',
      };
      const testContent = npmUpdater.updateDependency({
        fileContent: null,
        upgrade,
      });
      expect(testContent).toBeNull();
    });

    it('replaces package', () => {
      const upgrade = {
        depType: 'dependencies',
        depName: 'config',
        newName: 'abc',
        newValue: '2.0.0',
      };
      const testContent = npmUpdater.updateDependency({
        fileContent: input01Content,
        upgrade,
      });
      expect(JSON.parse(testContent).dependencies.config).toBeUndefined();
      expect(JSON.parse(testContent).dependencies.abc).toBe('2.0.0');
    });

    it('replaces glob package resolutions', () => {
      const upgrade = {
        depType: 'dependencies',
        depName: 'config',
        newName: 'abc',
        newValue: '2.0.0',
      };
      const testContent = npmUpdater.updateDependency({
        fileContent: input01GlobContent,
        upgrade,
      });
      expect(JSON.parse(testContent).resolutions.config).toBeUndefined();
      expect(JSON.parse(testContent).resolutions['**/abc']).toBe('2.0.0');
    });
  });
});
