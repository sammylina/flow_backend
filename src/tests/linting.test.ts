import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';

const execAsync = promisify(exec);

describe('Linting Setup', () => {
  it('should have ESLint configured and working', async () => {
    try {
      const { stdout } = await execAsync('npm run lint');
      expect(stdout).toContain('eslint src/**/*.ts');
    } catch (error: any) {
      // If there are linting errors, the command will fail
      // but we still want to check that ESLint is running
      expect(error.stdout || error.message).toContain('eslint src/**/*.ts');
    }
  });

  it('should have Prettier configured and working', async () => {
    try {
      const { stdout } = await execAsync('npm run format:check');
      expect(stdout).toContain('Checking formatting...');
    } catch (error: any) {
      // If there are formatting errors, we still want to verify Prettier is running
      expect(error.stderr || error.message).toContain('Code style issues found');
    }
  });

  it('should have lint-staged configured', () => {
    const lintStagedConfig = fs.readFileSync('.lintstagedrc.json', 'utf8');
    const config = JSON.parse(lintStagedConfig);

    expect(Object.keys(config)).toContain('src/**/*.{ts,tsx}');
    expect(config['src/**/*.{ts,tsx}']).toEqual(
      expect.arrayContaining(['eslint --fix', 'prettier --write'])
    );
  });

  it('should have pre-commit hook configured', () => {
    const preCommitHook = fs.readFileSync('.husky/pre-commit', 'utf8');

    expect(preCommitHook).toContain('npx lint-staged');
  });

  it('should have proper ESLint configuration', () => {
    const eslintConfig = fs.readFileSync('.eslintrc.js', 'utf8');

    expect(eslintConfig).toContain('@typescript-eslint/parser');
    expect(eslintConfig).toContain('plugin:@typescript-eslint/recommended');
    expect(eslintConfig).toContain('prettier');
  });

  it('should have proper Prettier configuration', () => {
    const prettierConfig = fs.readFileSync('.prettierrc', 'utf8');
    const config = JSON.parse(prettierConfig);

    expect(config).toHaveProperty('semi', true);
    expect(config).toHaveProperty('singleQuote', true);
    expect(config).toHaveProperty('printWidth', 100);
  });
});
