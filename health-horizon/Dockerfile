# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Run stage
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]
