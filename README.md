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
const putResponse = await put('new-file.png')
console.log({ putResponse })
````

#### get
````typescript
const { get } = s3Drive(s3Config)
const getResponse = await get('new-file.png')
console.log({ getResponse })
````

#### remove
````typescript
const { remove } = s3Drive(s3Config)
const removeResponse = await put('new-file.png')
console.log({ removeResponse })
````

## Helpers
#### formatBase64StringIntoUrlData
````typescript
const { formatBase64StringIntoUrlData, get } = s3Drive(s3Config)
const getImage = await get('new-file.png','base64')
const urlFormattedPNG = formatBase64StringIntoUrlData(getImage,'image/png')
console.log({ urlFormattedPNG })
````

#### formatBase64StringIntoUrlData
````typescript
const { put } = s3Drive(s3Config)
const rawImageUpload = await put(filePath,convertBase64StringToImageData('data:image/png;base64,iVBORw0KG'))
console.log({ putResponse })
````
