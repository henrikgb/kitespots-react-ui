import type { NextApiRequest, NextApiResponse } from 'next'
import { createLocation, getLocations, LocationServiceError } from '@/service/LocationsService';
import { requireSession } from '@/util/auth/requireSession';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    if (!(await requireSession(req, res))) {
      return;
    }

    try {
      const location = await createLocation(req.body ?? {});
      res.status(201).json({ data: location });
    } catch (error) {
      if (error instanceof LocationServiceError) {
        res.status(error.statusCode).json({ error: error.message, errors: error.errors });
        return;
      }
      console.error('Error creating location:', error);
      res.status(500).json({ error: 'An error occurred while creating the location' });
    }
    return;
  }

  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
    return;
  }

  try {
    const data = await getLocations();
    res.status(200).json({ data });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'An error occurred while fetching locations' });
  }
}
