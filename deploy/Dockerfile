FROM node:12
MAINTAINER toktor <ak.toktor@gmail.com>

VOLUME [/frontend]
WORKDIR /frontend
COPY . .
RUN yarn install; npm run build

