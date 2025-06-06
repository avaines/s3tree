const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const { s3tree } = require('./s3tree');

async function cli() {
  const argv = yargs(hideBin(process.argv))
    .scriptName('s3tree')
    .usage('$0 <bucket> [options]')
    .command(
      '$0 <bucket>',
      'Show S3 bucket tree',
      yargs => {
        yargs.positional('bucket', {
          describe: 'The name of the S3 bucket',
          type: 'string',
          demandOption: true
        })
        .option('date', {
          alias: 'D',
          type: 'boolean',
          description: 'Print the date of the last modification time for the file listed.'
        })
        .option('directories-only', {
          alias: 'd',
          type: 'boolean',
          description: 'List directories only.'
        })
        .option('file-limit', {
          alias: 'F',
          type: 'number',
          description: 'Do not descend directories that contain more than # entries.'
        })
        .option('full-path', {
          alias: 'f',
          type: 'boolean',
          description: 'Prints the full path prefix for each file.'
        })
        .option('max-depth', {
          alias: 'L',
          type: 'number',
          description: 'Max display depth of the directory tree.'
        })
        .option('output', {
          alias: 'o',
          type: 'string',
          choices: ['text', 'json', 'yaml'],
          default: 'text',
          description: 'Output format: text (default), json, or yaml'
        })
        .option('region', {
          alias: 'r',
          type: 'string',
          description: 'AWS region of the S3 bucket (default: us-east-1).'
        })
        .option('role-arn', {
          alias: 'a',
          type: 'string',
          description: 'AWS IAM Role ARN to assume for S3 access.'
        })
        .option('size', {
          alias: 's',
          type: 'boolean',
          description: 'Print the size of each file in bytes.'
        })
        .option('sort-time', {
          alias: 't',
          type: 'boolean',
          description: 'Sort the output by last modification time.'
        })
      }
    )
    .version()
    .help()
    .demandCommand(1, 'You must provide the bucket name as the first argument.')
    .argv;

  if (argv.o == 'text') {
    console.log('Bucket:', argv.bucket, '. Please wait...')
    // console.warn('Options:', argv);
  }

  await s3tree(argv.bucket, argv);
}

module.exports = cli;
