# Drive S3 Wrapper

Agnostic wrapper for AWS S3


### S3 Config
````typescript
const s3Config = {
    bucket: process.env.S3_BUCKET,
    forcePathStyle: true,
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_KEY,
        secretAccessKey: process.env.S3_SECRET
    }
}
````

## Available Methods

#### put
````typescript
const { put } = s3Drive(s3Config)
const putResponse = await put('new-file.jpg')
console.log(putResponse)
````

#### get
````typescript
const { get } = s3Drive(s3Config)
const getResponse = await get('new-file.jpg')
console.log(getResponse)
````

#### remove
````typescript
const { remove } = s3Drive(s3Config)
const removeResponse = await put('new-file.jpg')
console.log(removeResponse)
````
