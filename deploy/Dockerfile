FROM node:12
MAINTAINER toktor <ak.toktor@gmail.com>

VOLUME [/frontend]
WORKDIR /frontend
COPY . .
ARG TAG=prod
ENV TAG=${TAG}
RUN npm install; echo ${TAG}; TAG=${TAG} npm run build