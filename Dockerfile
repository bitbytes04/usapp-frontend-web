    # Stage 1: Build the React application
    FROM node:20-alpine as builder

    RUN npm install -g serve

    WORKDIR /app


    COPY --from=build /app/build ./build

    EXPOSE 8080
    CMD ["serve", "-s", "build", "-l", "8080"]