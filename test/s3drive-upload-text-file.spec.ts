import {s3Drive} from "../src";
import 'dotenv/config'

const filePath = 'example-file.txt'
const multiFolderPath = 'test/example/file/test.txt'

const config = {
    bucket: process.env.S3_BUCKET,
    forcePathStyle: true,
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_KEY,
        secretAccessKey: process.env.S3_SECRET
    }
}
const { put, get, remove } = s3Drive(config)


describe('api', () => {

    if(!process.env.S3_BUCKET){
        it('No Bucket', async () => {
            console.log('No Bucket')
        })
        return
    }

    it('It puts an item into a bucket', async () => {
        const putFileIntoBucket = await put(filePath,'example text goes here')
        expect(putFileIntoBucket?.httpStatusCode).toBe(200);
    })

    it('It puts a multi folder item into a bucket', async () => {
        const putFileIntoBucket = await put(multiFolderPath,`example text goes here for file: ${multiFolderPath}`)
        expect(putFileIntoBucket?.httpStatusCode).toBe(200);
    })

    it('It removes a multi folder item from a bucket', async () => {
        const removeMultiFolderFileFromBucket = await remove(multiFolderPath)
        expect(removeMultiFolderFileFromBucket?.httpStatusCode).toBe(204);
    })

    it('It gets an invalid item from a bucket', async () => {
        const getFileFromBucket = await get(`${filePath}.--doesnt-exist.txt`).catch(()=> false)
        expect(getFileFromBucket).toBe(false);
    })

    it('It gets an item from a bucket', async () => {
        const getFileFromBucket = await get(filePath)
        expect(getFileFromBucket).toBe('example text goes here');
    })

    it('It remove an item from a bucket', async () => {
        const removeFileFromBucket = await remove(filePath)
        expect(removeFileFromBucket?.httpStatusCode).toBe(204);
    })
})
