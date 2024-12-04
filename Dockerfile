FROM node:18

WORKDIR /test-suite

COPY package.json ./
COPY tests/ ./tests
COPY config/ ./config

RUN npm i
CMD [ "npm", "t" ]