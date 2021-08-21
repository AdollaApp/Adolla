FROM node:alpine AS build
WORKDIR /app
COPY . .
RUN npm ci --only=production
 
FROM node:alpine
WORKDIR /app
COPY --from=build /app /app
EXPOSE 8085
CMD ["npm", "start"]