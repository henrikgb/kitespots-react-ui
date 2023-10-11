# Kite Surf Weather Forecast in Rogaland

Welcome to the Kite Surf Weather Forecast application for Rogaland. This application utilizes a combination of technologies to provide kite surfers with accurate wind and rain forecasts for various locations in Rogaland, ensuring a great kite surfing experience.

## Table of Contents
- [Technologies](#technologies)
- [Setup](#setup)
- [Features](#features)
- [Contribute](#contribute)

## Technologies

This project uses a mix of technologies to ensure efficient and smooth operation:

### Frontend:
- **Framework**: React Next.js with TypeScript support.
- **Styling**: Tailwindcss for UI design.
- **Maps**: Leaflet React for location mapping.
- **Data Visualization**: Apache Echarts for visualizing weather forecast data.
- **HTTP Client**: Axios and Next.js to fetch weather data.
- **Code Quality**: ESLint for code formatting and linting.
- **Localization**: i18n for multilingual support, including English and Norwegian.
- **Themes**: Switch toggle for transitioning between normal and dark mode styles.

### Backend:
- Written in C#.
- Utilizes Azure Function App to fetch data from OpenWeatherMap API once every hour.
- Saves the fetched data in Azure blob storage.

## Setup

To get the project up and running:

1. **Frontend Setup**:
   ```bash
   git clone [repository-url]
   cd [repository-folder]
   npm install
   npm run dev
2. **Backend Setup**:
- Set up Azure Function App and configure it with your OpenWeatherMap API key.
- Ensure the Azure blob storage connection is properly set up.

## Features
- Kite Surf Locations: Display various kite surfing locations in Rogaland on a map.
- Weather Forecast: Fetch and display wind and rain forecasts for kite surf spots.
- Visualization: Use Apache Echarts for a clear and intuitive visualization of weather data.
- Localization: Seamlessly switch between Norwegian and English languages.
- Dark Mode: Comfortable viewing in all lighting conditions with a toggleable dark mode.

## Contribute
I value contributions! Please review the issues for pending features or bugs. Feel free to open a new issue or send a pull request. Ensure your code follows our ESLint configurations for consistency.  
