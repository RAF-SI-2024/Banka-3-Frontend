# Build stage
FROM node:20-alpine AS build
WORKDIR /front-app

COPY App/package*.json App/angular.json ./
RUN npm ci

COPY App/. .

RUN npx ng build --configuration production
# Production stage
FROM nginx:alpine

sudo mkdir /var/www/app.com

COPY --from=build /front-app/dist/app/browser /var/www/app.com
COPY nginx-default.conf /etc/nginx/sites-enabled/default

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
