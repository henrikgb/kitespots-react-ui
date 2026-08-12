import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchLocationImage } from '@/repository/LocationImageRepository';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  const blobPath = Array.isArray(path) ? path.join('/') : path;

  if (!blobPath) {
    res.status(400).json({ error: 'Missing image path' });
    return;
  }

  try {
    const image = await fetchLocationImage(blobPath);
    if (!image) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }
    res.setHeader('Content-Type', image.contentType);
    res.status(200).send(image.data);
  } catch (error) {
    console.error('Error fetching location image:', error);
    res.status(500).json({ error: 'An error occurred while fetching the location image' });
  }
}
