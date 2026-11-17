FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY server ./server
COPY public ./public
ENV PORT=3000 DRIM_DATA=/data
VOLUME /data
EXPOSE 3000
CMD ["node", "server/index.js"]
