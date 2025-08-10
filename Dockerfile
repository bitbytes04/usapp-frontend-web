# Stage 1: Build the React application
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .


RUN npm run build

FROM node:20-alpine
RUN npm install -g serve


WORKDIR /app


COPY --from=builder /app/build ./build


EXPOSE 8080

CMD ["serve", "-s", "build", "-l", "8080"]