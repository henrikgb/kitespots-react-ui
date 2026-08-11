import type { NextApiRequest, NextApiResponse } from 'next'
import { getWeatherData } from '@/service/WeatherDataService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await getWeatherData();
    res.status(200).json({ data });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'An error occurred while fetching weather data' });
  }
}
