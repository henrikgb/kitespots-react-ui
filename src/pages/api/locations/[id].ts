import type { NextApiRequest, NextApiResponse } from 'next'
import { deleteLocation, LocationServiceError } from '@/service/LocationsService';
import { requireSession } from '@/util/auth/requireSession';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
    return;
  }

  if (!(await requireSession(req, res))) {
    return;
  }

  const { id } = req.query;
  const locationId = Array.isArray(id) ? id[0] : id;

  if (!locationId) {
    res.status(400).json({ error: 'Missing location id' });
    return;
  }

  try {
    await deleteLocation(locationId);
    res.status(204).end();
  } catch (error) {
    if (error instanceof LocationServiceError) {
      res.status(error.statusCode).json({ error: error.message, errors: error.errors });
      return;
    }
    console.error('Error deleting location:', error);
    res.status(500).json({ error: 'An error occurred while deleting the location' });
  }
}
