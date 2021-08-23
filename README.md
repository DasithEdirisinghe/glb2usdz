# glb2usdz

<!--- These are examples. See https://shields.io for others or to customize this set of shields. You might want to include dependencies, project status and licence info here --->
![GitHub repo size](https://img.shields.io/github/repo-size/DasithEdirisinghe/glb2usdz)

Project is based on glb -> usdz convertion which use [This](https://github.com/google/usd_from_gltf#compatibility) google c++ library under the hood and this is focusing on the build the convertion system on top of the AWS Lambda using the [AWS Lambda Container Image Support](https://aws.amazon.com/blogs/aws/new-for-aws-lambda-container-image-support/).

Read [my article](https://towardsaws.com/create-a-docker-container-image-with-custom-lambda-runtime-c1c73944d87e) to get a basic idea about the AWS container image support

### What is glb(or gltf)

glTF is a transmission format for 3D assets that is well suited to the web and mobile devices by removing data that is not important for efficient display of assets. USD is an interchange format that can be used for file editing in Digital Content Creation tools.

## Prerequisites

* AWS account

* EC2 instance:
    * c4 x2large is recommended with 16 GB of storage

* Following AWS architecture is used here

![alt text](https://github.com/DasithEdirisinghe/glb2usdz/blob/11a23816cad5be481677774e478c261dcf06623b/img/awsarchi.jpg?raw=true)


    * API Gateway -> SQS -> Lambda -> (s3,dynamodb,EFS)

    * API gateway is used to send a message to SQS (This can be done using an update API)

    * Sample SQS message format:

```javascript
    {
        "bucket": "s3bucket",
        "table": "dynamodbtable",
        "s3modelPath": "s3dir/xxxxxxx.glb",
        "s3modelPathUsdz": "s3dir/yyyyyyy.usdz",
        "modelPathUsdz": "clodfront/yyyyyyy.usdz",
        "designId": "zzzzzzzzzzz",
        "userId": "xyzxyzxyz",
        "s3modelPathId": "xxxxxxx"
      }
```

* Then SQS will trigger the lambda function

## Using <glb2usdz>

* ssh in to the ec2 instance and configure

* Clone the project

```bash
git clone git@github.com:DasithEdirisinghe/glb2usdz.git
```
  
* <glb2usdz> project has two main files:

    * Dockerfile:
        * Based on the [this](https://hub.docker.com/repository/docker/dasithdev/usd-from-gltf) docker image
        * server.lambdaHandler will invoke when the lambda function is triggered

    * server.js

        Does main use cases:

        * Download a glb file from the S3 bucket
        * Convert it into the usdz format
        * Upload the usdz file to the s3 bucket
        * Update the dynamodb table

* Then CD to the glb2usdz directory and follow these steps

```bash
sudo docker login --username AWS --password $(aws ecr get-login-password --region REGION) xxxxxxxxxxx.dkr.ecr.REGION.amazonaws.com

sudo docker build -t ECR_REPO:tag .

sudo docker tag ECR_REPO:tag xxxxxxxxxxx.dkr.ecr.REGION.amazonaws.com/ECR_REPO:tag

sudo docker push xxxxxxxxxxx.dkr.REGION.amazonaws.com/ECR_REPO:tag
```

* Make sure to change REGION, ECR_REPO as well as the xxxxxxxxxx 

* Then Create a lambda function using container image and deploy the image you pushed into the ECR_REPO 


## Contributors

Thanks to the following people who have contributed to this project:

* [@DasithEdirisinghe](https://github.com/DasithEdirisinghe) 📖

## Contact

If you want to contact me you can reach me at <udasith@gmail.com>.

## License
<!--- If you're not sure which open license to use see https://choosealicense.com/--->

This project uses the following license: [<MIT>](<https://github.com/DasithEdirisinghe/glb2usdz/blob/6ffb307ccc8b0cde9a16e8a0b3f16a55538289c3/LICENSE>).
