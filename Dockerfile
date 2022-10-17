FROM node:16.17.0-alpine3.16@sha256:2c405ed42fc0fd6aacbe5730042640450e5ec030bada7617beac88f742b6997b
WORKDIR /app
ADD src/ src/
COPY ["package.json", "package-lock.json", "./"]
RUN npm install --location=global npm && npm install
ARG NOTION_DATABASE_ID
ARG NOTION_API_KEY
ARG FETCH_INTERVAL=30
ENTRYPOINT [ "npm", "run", "start" ]
