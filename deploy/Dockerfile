FROM node:12
MAINTAINER toktor <ak.toktor@gmail.com>

VOLUME [/frontend]
WORKDIR /frontend
COPY . .
ARG TAG=prod
ENV TAG=${TAG}
RUN npm install; REACT_APP_TAG=${TAG} npm run build