FROM node:lts-stretch-slim

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

RUN npm install -g ts-node

COPY . .

CMD ["ts-node", "server.ts"]
