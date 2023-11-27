FROM node:alpine
ENV NODE_ENV=production

ADD src /app
WORKDIR /app
RUN npm install --production

CMD ["node", "index.js"]
