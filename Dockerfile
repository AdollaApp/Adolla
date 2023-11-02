# Stage 1: Build the application
FROM node:16-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Run the application
FROM node:16-alpine

WORKDIR /app

COPY --from=builder /app/ .

# Create a non-root user and switch to that user
RUN addgroup -g 1001 adollagroup && adduser -u 1001 -G adollagroup -s /bin/sh -D adolla
USER adolla

# Set environment variables
ENV NODE_ENV production

EXPOSE 8080

CMD ["npm", "start"]
