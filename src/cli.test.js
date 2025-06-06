jest.mock('./s3tree');

const { s3tree } = require('./s3tree');
const cli = require('./cli');

describe('cli', () => {
  beforeEach(() => {
    s3tree.mockClear();
  });

  it('calls s3tree with bucket and options', async () => {
    process.argv = ['node', 'cli.js', 'my-bucket', '-d', '-f'];
    await cli();
    expect(s3tree).toHaveBeenCalledWith('my-bucket', expect.objectContaining({
      d: true,
      f: true,
      bucket: 'my-bucket'
    }));
  });

  it('shows error if bucket is missing', async () => {
    process.argv = ['node', 'cli.js'];
    const spyError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const spyExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
    await cli();
    expect(spyError).toHaveBeenCalled();
    expect(spyExit).toHaveBeenCalledWith(1);
    spyError.mockRestore();
    spyExit.mockRestore();
  });
});
