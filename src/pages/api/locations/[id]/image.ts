import type { NextApiRequest, NextApiResponse } from 'next'
import { attachLocationImage, LocationServiceError } from '@/service/LocationsService';
import { requireSession } from '@/util/auth/requireSession';
import { MAX_IMAGE_SIZE_BYTES } from '@/domain/locationValidation';

// The image is sent as a raw binary body (fetch(url, { method: "POST", body: file })), not
// multipart/form-data, so there is no need for a multipart-parsing dependency - just read the
// stream directly with Next's built-in body parser disabled.
export const config = {
  api: {
    bodyParser: false,
  },
};

class PayloadTooLargeError extends Error {}

const readRawBody = (req: NextApiRequest, limitBytes: number): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;

    req.on('data', (chunk: Buffer) => {
      total += chunk.length;
      if (total > limitBytes) {
        req.destroy();
        reject(new PayloadTooLargeError('Request body too large'));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
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
    // Allow a little slack over the limit so an oversized upload is read fully enough to be
    // rejected with a clear validation error rather than an abrupt connection reset.
    const data = await readRawBody(req, MAX_IMAGE_SIZE_BYTES + 1024);
    const location = await attachLocationImage(locationId, data, req.headers['content-type']);
    res.status(200).json({ data: location });
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      res.status(413).json({ error: 'Image file is too large.' });
      return;
    }
    if (error instanceof LocationServiceError) {
      res.status(error.statusCode).json({ error: error.message, errors: error.errors });
      return;
    }
    console.error('Error uploading location image:', error);
    res.status(500).json({ error: 'An error occurred while uploading the image' });
  }
}
