# Use the official Node.js image based on Alpine Linux as the base image
FROM node:lts-alpine3.20 AS base

# Set the working directory
WORKDIR /app

# Copy the `package.json` and `package-lock.json` files over to the container
COPY package*.json ./

# Install the dependencies
RUN npm install --only=production

# Copy the application files over to the container
COPY . .

# Set environment variables for production
ENV NODE_ENV=production
ENV AZURE_STORAGE_CONNECTION_STRING=$AZURE_STORAGE_CONNECTION_STRING
ENV AZURE_KITESPOTSAD77_CONNECTION_STRING=$AZURE_KITESPOTSAD77_CONNECTION_STRING

# Build the Next.js app for production
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
