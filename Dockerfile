# BASE STAGE ##########################################################################################################
  #Starts from the node:lts-alpine3.20 image and sets up the working directory.
  #Copies package.json and installs the dependencies.
  #Copies the entire application code.

# Base image
FROM node:18.0.0-alpine AS base

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the application files
COPY . .

# BUILD STAGE #########################################################################################################
# Uses the base image again as the starting point, allowing you to set a build argument (NODE_ENV), defaulting to production.
  #Runs the npm run build command only if the NODE_ENV is set to production, which means the actual production build is created.

FROM base AS build
ARG NODE_ENV=production

# Set environment variable based on the build argument (default: production)
ENV NODE_ENV=$NODE_ENV

# SECURITY: the Azure Storage connection string (AZURE_KITESPOTSAD77_CONNECTION_STRING) must
# NEVER be passed as a build ARG or baked into a NEXT_PUBLIC_* variable here. NEXT_PUBLIC_*
# values get inlined into the client-side JavaScript bundle at build time and shipped to every
# browser - a storage account connection string is full read/write access to the account, so
# that would hand out the keys to the whole storage account to any site visitor. It is also
# not needed at build time at all: it is only read server-side, at request time, by the API
# routes under src/pages/api/ (see src/repository/*.ts) - so it belongs in the *runtime*
# environment of the running container (e.g. `docker run -e AZURE_KITESPOTSAD77_CONNECTION_STRING=...`,
# or the hosting platform's application settings / secrets), never as a build ARG. See .env.example.
#
# NEXT_PUBLIC_KITESPOTS_ADMIN_EMAILS is the one exception: it is genuinely meant to be public
# (an email allowlist, not a credential - see src/domain/adminAuthorization.ts) and does need to
# be present at build time to be inlined into the client bundle, so it is safe and correct to
# pass as a build ARG if you want the admin UI hint baked into a prebuilt image.
ARG NEXT_PUBLIC_KITESPOTS_ADMIN_EMAILS
ENV NEXT_PUBLIC_KITESPOTS_ADMIN_EMAILS=$NEXT_PUBLIC_KITESPOTS_ADMIN_EMAILS

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
