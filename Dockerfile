FROM node:16-alpine

EXPOSE 3000

RUN mkdir /app
WORKDIR /app
ADD package.json /app/
RUN yarn --pure-lockfile
ADD . /app

CMD ["yarn", "start"]
