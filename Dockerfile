FROM node:14
WORKDIR /opt/app
ADD . .
RUN pnpm install
RUN pnpm run build api
CMD [ "node", "./dist/src/main.js" ]