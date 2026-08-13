# kitespots-react-ui: Kite Surf Weather Forecast in Rogaland

## Weather data provider

Weather forecasts are fetched hourly from the [MET Norway / Yr Locationforecast API](https://api.met.no/weatherapi/locationforecast/2.0/documentation) by a separate Azure Function App ([FetchMeteomaticsWeatherData](https://github.com/henrikgb/FetchMeteomaticsWeatherData) - the repo name predates the Yr migration below and hasn't been renamed), and stored in Azure Blob Storage at `weather/<locationId>.json` per kite spot, in a provider-independent `WeatherData` shape (see `src/types/model/WeatherData.ts`). This frontend reads that data server-side (see `src/repository/WeatherDataRepository.ts`) and never talks to Yr directly - Yr-specific request/response shapes never leave the Function App.

The backend previously used Meteomatics, but that integration relied on a free tier Meteomatics discontinued, which is why weather data was stale for a period. It has since been fully replaced with the Yr/MET Norway integration described above - no Meteomatics code, credentials, or environment variables remain in either repository; the Yr API is free and needs no API key, only an identifying `User-Agent` header (see the Function App's `YrLocationForecastClient`).

## Kite spot locations and images

`locations.json` in the `weatherdata` Blob Storage container is the **single authoritative source** of kite spot locations for both this frontend and the Function App - there is no hardcoded location list anywhere in production code on either side. Its shape:

```json
{
  "schemaVersion": 1,
  "locations": [
    {
      "id": "sande",
      "name": "Sande",
      "latitude": 59.02,
      "longitude": 5.59,
      "imageBlobName": "location-images/sande.png",
      "beginnerScore": 3,
      "freestyleScore": 5,
      "waveScore": 5,
      "windDirectionDescriptions": [
        { "intervalStart": 0, "intervalStop": 180, "category": "offshore", "colorCode": "#FD0100" }
      ]
    }
  ]
}
```

- **Reading**: `src/repository/LocationsRepository.ts` downloads and validates it server-side on every request (`fetchLocations`) - nothing is cached, so an admin edit is visible immediately. The Function App independently re-downloads and validates the same blob on every scheduled run (see its README) - neither side caches or hardcodes the location list.
- **Images**: each location's `imageBlobName` points into the public `location-images` Blob Storage container (`access: "blob"` - anonymous *read* of individual blobs only, no container listing; write always requires the server-only connection string). `src/repository/LocationImagesRepository.ts` resolves `imageBlobName` into a public, directly-fetchable URL server-side (`getLocationImageUrl`) - the browser fetches images straight from Blob Storage, not through a Next.js proxy.
- **Adding/deleting a location or its image**: sign in at `/Settings` with an account in the `NEXT_PUBLIC_KITESPOTS_ADMIN_EMAILS` allowlist (see `.env.example`) to reach the kite spot admin panel. Add/delete/upload-image all go through authenticated API routes (`POST`/`DELETE /api/locations`, `POST /api/locations/[id]/image`) which read-modify-write `locations.json` under Blob Storage ETag optimistic concurrency (see `src/service/LocationsService.ts`) - two concurrent edits fail with a 409 instead of silently overwriting each other. Deleting a location also removes its image and `weather/<id>.json` blob so nothing can reappear as an orphaned "phantom" location. A change takes effect on the Function App's very next scheduled run with no redeploy.
- **Image migration script**: `scripts/migrate-location-images.mjs` is a one-off/re-runnable migration that uploads the original static beach photos under `src/assets/images/` into the `location-images` container - kept (and its source images kept alongside it) as the way to re-seed that container if it's ever recreated, not as part of the running application.

### Required initial Blob Storage setup

A brand-new storage account needs, in the `weatherdata` container:
- `locations.json` seeded once (see the Function App README's "Seeding locations.json").

The `location-images` container is created automatically (with `access: "blob"`) the first time an image is uploaded via the admin UI or `scripts/migrate-location-images.mjs`; it does not need to be created manually. The `weatherdata` container itself should be left at its default **private** access level - it is only ever read through this app's API routes and the Function App, never directly by the browser.

---------------------------------------------------------------------------------------------------------------------------------------------------------

Welcome to kitespots-react-ui, the Kite Surf Weather Forecast application for Rogaland. This application utilizes a combination of technologies to provide kite surfers with accurate wind and rain forecasts for various locations in Rogaland, ensuring a great kite surfing experience.


# Table of Contents
- [Weather data provider](#weather-data-provider)
- [Kite spot locations and images](#kite-spot-locations-and-images)
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
