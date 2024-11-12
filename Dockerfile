FROM node:22.11.0-alpine3.20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

CMD ["npm", "run", "start:dev"]