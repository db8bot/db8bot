# syntax=docker/dockerfile:1

FROM node:16.13.0-alpine3.14

ENV NODE_ENV=production

WORKDIR /db8bot

COPY package*.json ./

RUN npm install --production

COPY . .

CMD ["npm", "start"]
