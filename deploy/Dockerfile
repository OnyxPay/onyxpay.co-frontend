FROM node:12
MAINTAINER toktor <ak.toktor@gmail.com>

VOLUME [/frontend]
WORKDIR /frontend
COPY . .
RUN npm install; npm run build

