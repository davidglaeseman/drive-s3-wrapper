import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	HeadObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { ResponseMetadata } from "@smithy/types/dist-types/response";
import * as mime from "mime-types";

export interface S3DriveConfig {
	bucket: string;
	forcePathStyle: boolean;
	endpoint: string;
	region: string;
	rootFolder?: string;
	credentials: {
		accessKeyId: string;
		secretAccessKey: string;
	};
}

export type Base64Data = string | ReadableStream<string | Buffer> | Uint8Array;

export type GetTypes = "string" | "byteArray" | "webStream" | "base64";

export interface MimeTypeResponse {
	ContentType: string;
	ContentEncoding: string | null;
}

export interface PutOptions {
	ACL:
		| "private"
		| "public-read"
		| "public-read-write"
		| "authenticated-read"
		| "aws-exec-read"
		| "bucket-owner-read"
		| "bucket-owner-full-control";
}

export interface s3DriveResponse {
	get: (
		filePath: string,
		type?: GetTypes,
	) => Promise<ReadableStream | Uint8Array | string>;
	put: (
		filePath: string,
		body: string | Buffer,
		options?: PutOptions,
	) => Promise<ResponseMetadata>;
	remove: (filePath: string) => Promise<boolean>;
	exists: (filePath: string) => Promise<boolean>;
	formatBase64StringIntoUrlData: (
		base64EncodedData: string | ReadableStream<string | Buffer> | Uint8Array,
		type: string,
	) => string;
	convertBase64StringToImageData: (base64EncodedData: string) => Buffer;
	determineMimeType: (filePath: string) => MimeTypeResponse;
}

export const s3Drive = (s3DriveConfig: S3DriveConfig): s3DriveResponse => {
	const Bucket = s3DriveConfig.bucket;
	const client = new S3Client({
		forcePathStyle: s3DriveConfig.forcePathStyle,
		endpoint: s3DriveConfig.endpoint,
		region: s3DriveConfig.region,
		credentials: {
			accessKeyId: s3DriveConfig.credentials.accessKeyId,
			secretAccessKey: s3DriveConfig.credentials.secretAccessKey,
		},
	});

	/**
     * Helpers
        - determineMimeType
        - formatBase64StringIntoUrlData
        - convertBase64StringToImageData
     */

	/**
	 * Get the mime type from the file path
	 * returns {ContentType, ContentEncoding}
	 * @param filePath
	 */
	const determineMimeType = (filePath: string): MimeTypeResponse => {
		let fileUpdatedFilePath = filePath;
		if (filePath?.includes("/")) {
			fileUpdatedFilePath = filePath.split("/").reverse()[0];
		}

		const contentType = mime
			?.contentType(fileUpdatedFilePath)
			?.toString()
			?.replace(";", "")
			.split(" ");
		if (!contentType[0] && !contentType[1]) {
			return {
				ContentType: "text/plain",
				ContentEncoding: "charset=utf-8",
			};
		}
		return {
			ContentType: contentType[0] ?? null,
			ContentEncoding: contentType[1] ?? null,
		};
	};

	/**
	 * Format a Base64 encoded string into valid url data
	 * @param base64EncodedData
	 * @param type
	 */
	const formatBase64StringIntoUrlData = (
		base64EncodedData: Base64Data,
		type: string,
	): string => `data:${type};base64,${base64EncodedData.toString()}`;

	/**
	 * Convert Base64 encoded string into buffer data
	 * @param base64String
	 */
	const convertBase64StringToImageData = (base64String: string): Buffer => {
		const base64StringSplit = base64String?.split(";base64,").pop();
		return Buffer.from(base64StringSplit, "base64");
	};

	const fullFilePath = (filePath: string) => s3DriveConfig?.rootFolder ? `${s3DriveConfig?.rootFolder}${filePath}` : filePath

	const put = async (
		filePath: string,
		body: string | Buffer,
		options?: PutOptions,
	): Promise<ResponseMetadata> => {
		try {
			const response = await client.send(
				new PutObjectCommand({
					Bucket,
					Key: fullFilePath(filePath),
					Body: body,
					ACL: options?.ACL ?? "public-read",
					...options,
					...determineMimeType(filePath),
				}),
			);
			return response.$metadata;
		} catch (err) {
			return Promise.reject(err);
		}
	};

	const get = async (
		filePath: string,
		type?: GetTypes,
	): Promise<ReadableStream | Uint8Array | string> => {
		const command = new GetObjectCommand({
			Bucket,
			Key: fullFilePath(filePath),
		});

		try {
			const response = await client.send(command);

			if (type === "webStream") {
				return response.Body.transformToWebStream();
			}

			if (type === "byteArray") {
				return await response.Body.transformToByteArray();
			}

			if (type === "base64") {
				return await response.Body.transformToString("base64");
			}

			if (type === "string" || !type) {
				return await response.Body.transformToString();
			}
		} catch (err) {
			return Promise.reject(err);
		}
	};
	const remove = async (filePath: string): Promise<boolean> => {
		const command = new DeleteObjectCommand({
			Bucket,
			Key: fullFilePath(filePath),
		});

		try {
			const response = await client.send(command);
			return response.$metadata.httpStatusCode === 204
		} catch (err) {
			return false
		}
	};

	const exists = async(filePath: string): Promise<boolean> => {
		const command = new HeadObjectCommand({
			Bucket,
			Key: fullFilePath(filePath),
		});
		try {
			const response = await client.send(command);
			return response.$metadata.httpStatusCode === 200
		} catch (err) {
			return false
		}
	}

	return {
		get,
		put,
		remove,
		exists,
		// Helpers
		formatBase64StringIntoUrlData,
		convertBase64StringToImageData,
		determineMimeType,
	};
};
