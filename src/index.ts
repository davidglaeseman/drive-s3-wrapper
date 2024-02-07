import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client
} from "@aws-sdk/client-s3";
import * as mime from 'mime-types'

export interface S3DriveConfig{
    bucket: string
    forcePathStyle: boolean
    endpoint: string
    region: string
    credentials:{
        accessKeyId: string
        secretAccessKey: string
    }
}

export interface PutOptions {
    ACL: "private" | "public-read" | "public-read-write" | "authenticated-read" | "aws-exec-read" | "bucket-owner-read" | "bucket-owner-full-control",
}

export const s3Drive = (s3DriveConfig: S3DriveConfig) => {
    const Bucket = s3DriveConfig.bucket
    const client = new S3Client({
        forcePathStyle: s3DriveConfig.forcePathStyle,
        endpoint: s3DriveConfig.endpoint,
        region: s3DriveConfig.region,
        credentials: {
            accessKeyId: s3DriveConfig.credentials.accessKeyId,
            secretAccessKey: s3DriveConfig.credentials.secretAccessKey
        }
    });

    const determineMimeType = (filePath: string): {ContentType: string, ContentEncoding: string} => {
        if(filePath?.includes('/')){
            filePath = filePath.split('/').reverse()[0]
        }
        const contentType = mime?.contentType(filePath)?.toString()?.replace(';','').split(' ')
        if(!contentType[0] && !contentType[1]){
            return {
                ContentType: 'text/plain',
                ContentEncoding: 'charset=utf-8'
            }
        }
        return {
            ContentType: contentType[0],
            ContentEncoding: contentType[1],
        }
    }

    const put = async (filePath: string, body: any, options?:PutOptions) => {
        if(!options){
            options = {ACL:'public-read'}
        } else if(!options?.ACL){
            options.ACL = 'public-read'
        }
        try {
            const response = await client.send(new PutObjectCommand({
                Bucket,
                Key: filePath,
                Body: body,
                ...options,
                ...determineMimeType(filePath)
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
