const { formatTree } = require('./format');
const YAML = require('yaml');

const sampleItems = [
  { name: 'folder1/file1.txt', size: 123, lastModified: new Date('2025-01-01') },
  { name: 'folder1/file2.txt', size: 456, lastModified: new Date('2025-01-02') },
  { name: 'folder1/subfolder/file3.txt', size: 789, lastModified: new Date('2025-01-03') },
  { name: 'folder2/', size: 0 },
  { name: 'file4.txt', size: 42, lastModified: new Date('2025-01-04') },
];

describe('formatTree', () => {
  it('prints a basic tree', () => {
    const output = formatTree(sampleItems, {});
    expect(output).toContain('folder1');
    expect(output).toContain('file4.txt');
    expect(output).toContain('subfolder');
  });

  it('respects directories-only (-d)', () => {
    const output = formatTree(sampleItems, { d: true });
    expect(output).toContain('folder1');
    expect(output).toContain('subfolder');
    expect(output).not.toContain('file1.txt');
    expect(output).not.toContain('file4.txt');
  });

  it('shows full path with -f', () => {
    const output = formatTree(sampleItems, { f: true });
    expect(output).toContain('folder1/file1.txt');
    expect(output).toContain('folder1/subfolder/file3.txt');
  });

  it('shows file sizes with -s', () => {
    const output = formatTree(sampleItems, { s: true });
    expect(output).toContain('[123 bytes]');
    expect(output).toContain('[42 bytes]');
  });

  it('shows dates with -D', () => {
    const output = formatTree(sampleItems, { D: true });
    expect(output).toContain('(2025-01-01T00:00:00.000Z)');
  });

  it('limits depth with -L', () => {
    const output = formatTree(sampleItems, { L: 2 });
    expect(output).toContain('subfolder');
    // file3.txt should not appear because it's at depth 3
    expect(output).not.toContain('file3.txt');
  });

  it('limits entries with -F', () => {
    // Add many files to folder1 to trigger the limit
    const manyFiles = [];
    for (let i = 0; i < 10; i++) {
      manyFiles.push({ name: `folder1/file${i}.txt`, size: 1 });
    }
    const output = formatTree([...sampleItems, ...manyFiles], { F: 5 });
    expect(output).toContain('[file-limit 5 exceeded]');
  });

  it('outputs JSON with -o json', () => {
    const output = formatTree(sampleItems, { o: 'json' });
    const obj = JSON.parse(output);
    expect(obj.folder1.file1).toBeUndefined(); // structure check
    expect(obj.folder1.file1_txt).toBeUndefined();
    expect(typeof obj.folder1).toBe('object');
    expect(output.trim().startsWith('{')).toBe(true);
  });

  it('outputs YAML with -o yaml', () => {
    const output = formatTree(sampleItems, { o: 'yaml' });
    const obj = YAML.parse(output);
    expect(obj.folder1).toBeDefined();
    expect(output).toContain('folder1:');
    expect(output).toContain('file1.txt:');
  });
});