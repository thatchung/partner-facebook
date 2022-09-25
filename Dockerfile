FROM node:local
WORKDIR /app/node
COPY ./app .
RUN pwd && ls
RUN echo "====== BUILD APPS ======"
RUN yarn
RUN yarn build
CMD [ "yarn", "start" ]