FROM node:6.11-alpine

# use yarn to upgrade to npm5 because npm can't do it itself?
# https://stackoverflow.com/questions/44269086/how-to-upgrade-npm-to-npm5-on-the-latest-node-docker-image
RUN yarn global add npm@5

WORKDIR /usr/app

# TODO what about package-lock.json?
COPY package.json .

RUN npm install --quiet

COPY . .