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

COPY --from=builder /app/build ./build

CMD ["npm", "start"]