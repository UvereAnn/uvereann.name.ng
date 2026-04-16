#Stage 1: Build the react app
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
#npm run build creates the dist folder with static files
RUN npm run build

#Stage 2: Serve with Nginx
FROM nginx:alpine AS runtime

#Copy built React files to nginx's serving directory
COPY --from=builder /app/dist /usr/share/nginx/html

#Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]


