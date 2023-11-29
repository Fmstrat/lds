FROM node:alpine
ENV NODE_ENV=production

ADD src /app
WORKDIR /app
RUN npm install --omit=dev

CMD ["node", "index.js"]
