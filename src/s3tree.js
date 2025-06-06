const { S3Client, ListObjectsV2Command, GetBucketLocationCommand, STSClient, AssumeRoleCommand } = require('@aws-sdk/client-s3');
const { formatTree } = require('./utils/format');


async function getBucketRegion(bucketName) {
    const s3 = new S3Client({ region: 'us-east-1' }); // Default region for lookup
    try {
        const data = await s3.send(new GetBucketLocationCommand({ Bucket: bucketName }));
        return data.LocationConstraint || 'us-east-1';
    } catch (error) {
        console.error(`Error fetching bucket region: ${error.message}`);
        process.exit(1);
    }
}

async function getCredentialsForRole(roleArn, region) {
    const sts = new STSClient({ region });
    const res = await sts.send(new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: 's3tree-session'
    }));
    return {
        accessKeyId: res.Credentials.AccessKeyId,
        secretAccessKey: res.Credentials.SecretAccessKey,
        sessionToken: res.Credentials.SessionToken
    };
}

async function listS3Bucket(bucketName, options, region) {
    let credentials;
    if (options['role-arn'] || options.a) {
        credentials = await getCredentialsForRole(options['role-arn'] || options.a, region);
    }
    const s3 = new S3Client({ region, credentials });
    const params = {
        Bucket: bucketName,
        Delimiter: options.dirsfirst ? '/' : undefined,
    };

    try {
        const data = await s3.send(new ListObjectsV2Command(params));
        const items = (data.Contents || []).map(obj => ({
            name: obj.Key,
            size: obj.Size,
            lastModified: obj.LastModified,
            type: obj.Key.endsWith('/') ? 'directory' : 'file'
        }));
        return formatTree(items, options);
    } catch (error) {
        console.error(`Error fetching data from S3: ${error.message}`);
        process.exit(1);
    }
}

async function s3tree(bucketName, options) {
    if (!bucketName) {
        console.error('Bucket name is required.');
        process.exit(1);
    }

    let bucketRegion = options.r || await getBucketRegion(bucketName);
    const output = await listS3Bucket(bucketName, options, bucketRegion);
    console.log(output);
}

module.exports = { s3tree };