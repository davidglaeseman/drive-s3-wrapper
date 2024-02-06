import {PutObjectCommand, PutObjectCommandOutput, S3Client} from "@aws-sdk/client-s3";

export const s3Drive = () => {
    const Bucket = 'bucket-name-goes-here'
    const configuration = {
        forcePathStyle: false, // Configures to use subdomain/virtual calling format.
        endpoint: "https://sfo2.digitaloceanspaces.com",
        region: "us-west-1",
        credentials: {
            accessKeyId: process.env.SPACES_KEY,
            secretAccessKey: process.env.SPACES_SECRET
        }
    }
    console.log({configuration})
    const client = new S3Client({});
    const put = async (filePath: string, body: any): Promise<PutObjectCommandOutput> => {
        try {
            return await client.send(new PutObjectCommand({
                Bucket,
                Key: filePath,
                Body: body,
            }));
        } catch (err) {
            console.error(err);
            return Promise.reject(err)
        }
    }

    return {
        put
    }
}
