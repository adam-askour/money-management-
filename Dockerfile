FROM node:22-alpine AS frontend
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM composer:2 AS php-dependencies
WORKDIR /app
COPY backend/composer.json ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader

FROM php:8.4-apache
RUN apt-get update \
    && apt-get install -y --no-install-recommends libonig-dev \
    && docker-php-ext-install pdo_mysql mbstring \
    && a2enmod rewrite headers expires \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /var/www/app
COPY backend ./backend
COPY --from=php-dependencies /app/vendor ./backend/vendor
COPY --from=frontend /build/dist ./dist
COPY deploy/apache-vhost.conf /etc/apache2/sites-available/000-default.conf
RUN mkdir -p /var/www/app/backend/storage \
    && chown -R www-data:www-data /var/www/app/backend/storage
EXPOSE 8080
CMD ["apache2-foreground"]
