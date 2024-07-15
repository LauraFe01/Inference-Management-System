FROM node:lts-stretch-slim

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

RUN npm install -g ts-node nodemon

COPY . .

CMD ["nodemon", "--exec", "ts-node", "server.ts"]
