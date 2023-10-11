// pages/api/data.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { getWeatherData } from '@/Service/weatherDataService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await getWeatherData();
    res.status(200).json({ data });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
}
