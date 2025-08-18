# Step 1: Build stage
FROM node:20 AS build

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy all frontend code
COPY . .

# Build the React app
RUN npm run build

# Step 2: Serve stage
FROM nginx:stable-alpine

# Copy built files to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose Nginx port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
