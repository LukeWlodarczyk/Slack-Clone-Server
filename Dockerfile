FROM node:10.8.0

WORKDIR /app/src
COPY package-lock.json .
COPY package.json .
RUN npm install
COPY dist .
COPY wait-for-it.sh .
CMD node index.js
