import type { NextApiRequest, NextApiResponse } from 'next'
import { getMeteomaticsWeatherData } from '@/service/MeteomaticsWeatherDataService'; // Import the correct service

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await getMeteomaticsWeatherData();
    res.status(200).json({ data });
  } catch (error) {
    console.error('Error fetching Meteomatics data:', error);
    res.status(500).json({ error: 'An error occurred while fetching Meteomatics data' });
  }
}
