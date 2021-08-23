FROM dasithdev/usd-from-gltf:latest

WORKDIR /usr/app

ENV TMPDIR=/tmp

RUN apt-get update
RUN apt-get -y install curl dirmngr apt-transport-https lsb-release ca-certificates vim
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs

# Install aws-lambda-cpp build dependencies
RUN apt-get update && \
    apt-get install -y \
    autoconf \
    libtool \
    g++ \
    make \
    cmake \
    unzip \
    libcurl4-openssl-dev

COPY . .

RUN npm install


EXPOSE 8080

ENTRYPOINT ["npx", "aws-lambda-ric"]
CMD [ "server.lambdaHandler"]
