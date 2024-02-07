import {s3Drive} from "../src";

const filePath = 'example-file.txt'

describe('api', () => {
    it('It puts an item into a bucket', async () => {
        const { put } = s3Drive()
        const putFileIntoBucket = await put(filePath,'example text goes here')
        console.log('test', putFileIntoBucket)
    })

    it('It gets an invalid item from a bucket', async () => {
        const { get } = s3Drive()
        const getFileFromBucket = await get(`${filePath}.--doesnt-exist.txt`).catch(()=> false)
        console.log('FILE DATA:', {getFileFromBucket})
    })

    it('It gets an  item from a bucket', async () => {
        const { get } = s3Drive()
        const getFileFromBucket = await get(filePath)
        console.log('string:', {getFileFromBucket})
    })

    it('It gets a byteArray  item from a bucket', async () => {
        const { get } = s3Drive()
        const getFileFromBucket = await get(filePath,'byteArray')
        console.log('byteArray:', {getFileFromBucket})
    })

    it('It gets a webStream  item from a bucket', async () => {
        const { get } = s3Drive()
        const getFileFromBucket = await get(filePath,'webStream')
        console.log('webStream:', {getFileFromBucket})
    })

    it('It remove an item from a bucket', async () => {
        const { remove } = s3Drive()
        const removeFileFromBucket = await remove(filePath)
        console.log('remove:', {removeFileFromBucket})
    })
})
