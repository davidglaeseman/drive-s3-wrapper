import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    PutObjectCommandOutput,
    S3Client
} from "@aws-sdk/client-s3";
import 'dotenv/config'
export const s3Drive = () => {
    const Bucket = process.env.S3_BUCKET
    const client = new S3Client({
        forcePathStyle: false,
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION,
        credentials: {
            accessKeyId: process.env.S3_KEY,
            secretAccessKey: process.env.S3_SECRET
        }
    });
    const put = async (filePath: string, body: any) => {
        try {
            const response = await client.send(new PutObjectCommand({
                Bucket,
                Key: filePath,
                Body: body,
            }));
            return response.$metadata
        } catch (err) {
            return Promise.reject(err)
        }
    }
    const get = async (filePath: string, type?: 'string' | 'byteArray' | 'webStream') => {
        const command = new GetObjectCommand({
            Bucket,
            Key: filePath,
        });

        try {
            const response = await client.send(command);
            if(type === 'webStream'){
                return  response.Body.transformToWebStream();
            } else if(type === 'byteArray'){
                return await response.Body.transformToByteArray()
            }
            return await response.Body.transformToString();
        } catch (err) {
            return Promise.reject(err)
        }
    }
    const remove = async (filePath: string) => {
        const command = new DeleteObjectCommand({
            Bucket,
            Key: filePath,
        });

        try {
            const response = await client.send(command);
            return response.$metadata
        } catch (err) {
            return Promise.reject(err)
        }

    }

    return {
        get,
        put,
        remove
    }
}
