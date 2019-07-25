FROM node:12
MAINTAINER toktor <ak.toktor@gmail.com>

VOLUME [/frontend]
WORKDIR /frontend
COPY . .
ARG TAG=prod
RUN npm install; TAG=$TAG npm run build

