FROM node:10
WORKDIR /app
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY yarn.lock yarn.lock
RUN yarn install
COPY . .
EXPOSE 3000
