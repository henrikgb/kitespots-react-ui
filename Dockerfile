# BASE STAGE ##########################################################################################################
  #Starts from the node:lts-alpine3.20 image and sets up the working directory.
  #Copies package.json and installs the dependencies.
  #Copies the entire application code.

# Base image
FROM node:lts-alpine3.20 AS base

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the application files
COPY . .

# BUILD STAGE #########################################################################################################
# Uses the base image again as the starting point, allowing you to set a build argument (NODE_ENV), defaulting to production.
  #Sets environment variables that may be needed during the build process, such as Azure storage connection strings.
  #Runs the npm run build command only if the NODE_ENV is set to production, which means the actual production build is created.

FROM base AS build
ARG NODE_ENV=production

# Set environment variable based on the build argument (default: production)
ENV NODE_ENV=$NODE_ENV

# Load environment variables (for both production and development)
ARG AZURE_STORAGE_CONNECTION_STRING
ARG AZURE_KITESPOTSAD77_CONNECTION_STRING

ENV NEXT_PUBLIC_AZURE_STORAGE_CONNECTION_STRING=$AZURE_STORAGE_CONNECTION_STRING
ENV NEXT_PUBLIC_AZURE_KITESPOTSAD77_CONNECTION_STRING=$AZURE_KITESPOTSAD77_CONNECTION_STRING

# Production Build
RUN if [ "$NODE_ENV" = "production" ]; \
    then npm run build; \
    fi

# PRODUCTION STAGE ####################################################################################################
# This stage is meant to create the production-ready image.
  #It copies the built assets (.next directory) and node_modules from the build stage.
  #Exposes port 3000 and runs the application in production mode with npm start.

FROM base AS production
COPY --from=build /app/.next /app/.next
COPY --from=build /app/node_modules /app/node_modules

# Expose port 3000
EXPOSE 3000

# Start in production mode
CMD ["npm", "start"]

# DEVELOPMENT STAGE ###################################################################################################
# This stage is separate and allows you to run the application in development mode.
  #It also starts from the base image and exposes port 3000.
  #Runs the application with npm run dev, which enables features like hot-reloading.

FROM base AS development

# Expose port 3000
EXPOSE 3000

# Start in development mode
CMD ["npm", "run", "dev"]
