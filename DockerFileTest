# Build stage
FROM node:20-alpine AS build
WORKDIR /front-app

COPY App/package*.json App/angular.json ./
RUN npm ci

COPY App/. .

RUN npx ng build --configuration production
# Production stage
FROM nginx:alpine

COPY --from=build /front-app/dist/app/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
