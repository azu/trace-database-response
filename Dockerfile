FROM node:10
WORKDIR /app
# COPY
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY yarn.lock yarn.lock
COPY . .
# Run
RUN yarn install
EXPOSE 3000
