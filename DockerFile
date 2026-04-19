FROM node:24-alpine

WORKDIR /app

RUN npm install -g concurrently

COPY client/package*.json ./client/
COPY server/package*.json ./server/

RUN cd client && npm ci
RUN cd server && npm ci

COPY client ./client
COPY server ./server

RUN cd client && npm run build

RUN cd server && npm run build || true

EXPOSE 3000
EXPOSE 5000

CMD ["concurrently", "\"cd client && npm start\"", "\"cd server && npm start\""]