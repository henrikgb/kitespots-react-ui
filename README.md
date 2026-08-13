# kitespots-react-ui: Kite Surf Weather Forecast in Rogaland

## Weather data provider

Weather forecasts are fetched hourly from the [MET Norway / Yr Locationforecast API](https://api.met.no/weatherapi/locationforecast/2.0/documentation) by a separate Azure Function App, and stored in Azure Blob Storage at `weather/<locationId>.json` per kite spot. This frontend reads that data server-side (see `src/repository/WeatherDataRepository.ts`) and never talks to Yr directly.

The backend previously used Meteomatics, but that integration relied on a free tier Meteomatics discontinued, which is why weather data was stale for a period. It has since been replaced with the Yr/MET Norway integration described above.

---------------------------------------------------------------------------------------------------------------------------------------------------------

Welcome to kitespots-react-ui, the Kite Surf Weather Forecast application for Rogaland. This application utilizes a combination of technologies to provide kite surfers with accurate wind and rain forecasts for various locations in Rogaland, ensuring a great kite surfing experience.


# Table of Contents
- [Technologies](#technologies)
- [Setup](#setup)
- [Features](#features)
- [Contribute](#contribute)

# Technologies

This project uses a mix of technologies to ensure efficient and smooth operation:

## Frontend:
- **Framework**: React Next.js with TypeScript support.
- **Styling**: Tailwindcss for UI design.
- **Maps**: Leaflet React for location mapping.
- **Data Visualization**: Apache Echarts for visualizing weather forecast data.
- **HTTP Client**: Axios and Next.js to fetch weather data.
- **Code Quality**: ESLint for code formatting and linting.
- **Localization**: i18n for multilingual support, including English and Norwegian.

## Backend:
- Written in C#.
- Utilizes an Azure Function App to fetch data from the MET Norway / Yr Locationforecast API (https://api.met.no/weatherapi/locationforecast/2.0/documentation) once every hour.
- Saves the fetched data in Azure blob storage as a provider-independent weather contract.
- Link to repository: https://github.com/henrikgb/FetchMeteomaticsWeatherData

## Setup
To get the project up and running:

### Frontend Setup:
1. **Run in terminal**:
   ```bash
   git clone [repository-url]
   cd [repository-folder]
   npm install
   npm run dev

### Backend Setup:
- Set up the Azure Function App (no API credentials needed for Yr/MET Norway, just an Azure Storage connection string).
- Ensure the Azure blob storage connection is properly set up.

### Environment variables

Copy `.env.example` to `.env` and fill in real values (`.env` is gitignored - never commit it).

**Security boundary**: the Azure Storage connection string (`AZURE_KITESPOTSAD77_CONNECTION_STRING`) grants full read/write access to the storage account and must never reach the browser. It is only ever read by server-side code (`src/repository/*.ts`, `src/service/*.ts`), which is only ever imported from `src/pages/api/*.ts`:

```
Browser -> same-origin Next.js API route -> server-only env var -> @azure/storage-blob -> Azure Blob Storage
```

Only variables explicitly prefixed `NEXT_PUBLIC_` are safe to expose to the browser - Next.js inlines them into the client bundle at build time. Every other variable in `.env.example` is server-only and must **never** be given a `NEXT_PUBLIC_` name, passed as a Docker build `ARG`, or referenced from a React component. See `.env.example` for the full list and what each variable is for.

If deploying via Docker, runtime secrets (the storage connection string, NextAuth/Azure AD credentials) must be injected as **container environment variables at run time** (e.g. `docker run -e AZURE_KITESPOTSAD77_CONNECTION_STRING=...`), not as build arguments - see the comments in `Dockerfile`. If deploying to Azure Static Web Apps / App Service, set them under the resource's **Configuration > Application settings** in the Azure Portal, again as plain (non-`NEXT_PUBLIC_`) settings.

### Building and Running the Application in Docker
This project can be run in both production and development environments using Docker. Below are the instructions for building and running the application in each environment.

#### Prerequisites:
- Docker installed on your machine.

To build and run the application in a production environment, follow these steps:
1. **Build the Docker image**:
   ```bash
   docker build --build-arg NODE_ENV=production -t kitespots-prod .

2. **Run the Docker container**, passing the server-only secrets from your `.env` as runtime environment variables (never as build args - see "Environment variables" above):
   ```bash
   docker run -p 3001:3000 \
     -e AZURE_KITESPOTSAD77_CONNECTION_STRING="..." \
     -e AZURE_BLOB_PUBLIC_BASE_URL="..." \
     -e NEXTAUTH_URL="..." \
     -e AZURE_AD_CLIENT_ID="..." \
     -e AZURE_AD_CLIENT_SECRET="..." \
     -e AZURE_AD_TENANT_ID="..." \
     -e KITESPOTS_SECRET="..." \
     kitespots-prod

To build and run the application in a development environment, follow these steps:
1. **Build the Docker image**:
   ```bash
   docker build --build-arg NODE_ENV=development -t kitespots-dev .

2. **Run the Docker container**:
   ```bash
   docker run -p 3002:3000 kitespots-dev

Notes:
- Production: The production build optimizes your application for performance and runs it in a manner suitable for deployment.
- Development: The development build allows for hot-reloading and easier debugging during development.


## Features
- Kite Surf Locations: Display various kite surfing locations in Rogaland on a map.
- Weather Forecast: Fetch and display wind and rain forecasts for kite surf spots.
- Visualization: Use Apache Echarts for a clear and intuitive visualization of weather data.
- Localization: Seamlessly switch between Norwegian and English languages.

## Contribute
I value contributions! Please review the issues for pending features or bugs. Feel free to open a new issue or send a pull request. Ensure your code follows our ESLint configurations for consistency.  
