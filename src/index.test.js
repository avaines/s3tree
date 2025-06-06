jest.mock('./cli');

const cli = require('./cli');

describe('index.js', () => {
  it('calls cli and exits on error', async () => {
    cli.mockImplementationOnce(() => { throw new Error('fail'); });
    const spy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    await require('./index');
    expect(log).toHaveBeenCalledWith('Error:', 'fail');
    expect(spy).toHaveBeenCalledWith(1);
    spy.mockRestore();
    log.mockRestore();
  });

  it('calls cli successfully', async () => {
    cli.mockImplementationOnce(() => Promise.resolve());
    await require('./index');
    expect(cli).toHaveBeenCalled();
  });
});