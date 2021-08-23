const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { DynamoDBClient, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require('@aws-sdk/util-dynamodb');

exports.lambdaHandler = async (event) => {

  try {

    const body = JSON.parse(event["Records"][0]['body']);

    const bucket = body['bucket'];

    const table = body['table'];

    const s3modelPath = body['s3modelPath'];

    const s3modelPathUsdz = body['s3modelPathUsdz'];

    const modelPathUsdz = body['modelPathUsdz'];
   
    const designId = body['designId'];

    const userId = body['userId'];
   
    const s3modelPathId = body['s3modelPathId'];

    try {

      const s3 = new S3Client({
        region: "REGION"
      });

      const spawn_option = {
        cwd: '/mnt/access', 
        shell: 'bash'
      };

      const spawn_option_glb2usdzconvertion = {
        shell: 'bash'
      };

      await downloadFile(bucket, s3modelPath, s3modelPathId, s3);

      const {} = spawnSync('usd_from_gltf', [`/mnt/access/${s3modelPathId}.glb`, `/mnt/access/${s3modelPathId}.usdz`], spawn_option_glb2usdzconvertion);

      await uploadFile(`/mnt/access/${s3modelPathId}.usdz`, s3modelPathUsdz, bucket, s3);

      const {} = spawnSync('rm', ['-r', `${s3modelPathId}*`], spawn_option);

      await updateUsdz(table, userId, designId, modelPathUsdz);

      const response = {
        statusCode: 200,
        body: JSON.stringify({ message: "glb2UsdzConvertion Function Executed" })
      };
    
      console.log('Response: ',response);
      return response;

    }
    catch (err) {
      console.log("[ERROR]: ", err);
      console.log('body is: ', body);
      throw err;
    }
  }

  catch (error) {
    console.log("[ERROR]: ", error);
    throw error;
  }

  

};


const streamToString = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
};


async function downloadFile(bucket, s3modelPath, s3modelPathId, s3) {
  const params = {
    Key: s3modelPath,
    Bucket: bucket
  }
  const command = new GetObjectCommand(params);

  const { Body } = await s3.send(command);
  const bodyContents = await streamToString(Body);
  fs.writeFileSync(`/mnt/access/${s3modelPathId}.glb`, bodyContents);


};


async function uploadFile(filename, s3path, bucket, s3) {
  const data = fs.readFileSync(filename);
  const params = {
    Bucket: bucket,
    Key: s3path,
    Body: data
  };
  const command = new PutObjectCommand(params);

  await s3.send(command);
};


async function updateUsdz(table, userId, designId, modelPathUsdz) {
  const inputdb = {
    TableName: table,
    Key: marshall({
      'pk': `USER#${userId}`,
      'sk': `DESIGN#${designId}`
    }),
    UpdateExpression: 'set modelPathUsdz = :modelPathUsdz',
    ExpressionAttributeValues: marshall({
      ':modelPathUsdz': modelPathUsdz

    }),
    ReturnValues: "UPDATED_NEW"
  }
  const clientdb = new DynamoDBClient({ region: "REGION" });
  const commanddb = new UpdateItemCommand(inputdb);

  await clientdb.send(commanddb);
}
