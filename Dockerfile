FROM node:6
ENV NPM_CONFIG_LOGLEVEL warn

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ADD package.json ./
RUN npm install

ADD . .
RUN npm run build

EXPOSE 80
CMD ["node", "./server.js"]
