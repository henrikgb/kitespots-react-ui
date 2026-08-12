import type { NextApiRequest, NextApiResponse } from 'next'
import { getLocations } from '@/service/LocationsService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await getLocations();
    res.status(200).json({ data });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'An error occurred while fetching locations' });
  }
}
