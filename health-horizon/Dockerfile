
FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN mkdir -p /app/uploads \
    && chown -R node:node /app

USER node

EXPOSE 8080

CMD ["node", "server.js"]
