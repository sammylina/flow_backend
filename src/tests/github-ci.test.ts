import fs from 'fs';
import path from 'path';

describe('GitHub CI Configuration', () => {
  it('should have a valid CI workflow file', () => {
    const workflowPath = path.join(process.cwd(), '.github', 'workflows', 'ci.yml');
    expect(fs.existsSync(workflowPath)).toBe(true);

    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    expect(workflowContent).toContain('name: CI');
    expect(workflowContent).toContain('build-and-test');
    expect(workflowContent).toContain('npm run build');
    expect(workflowContent).toContain('npm test');
  });
});
