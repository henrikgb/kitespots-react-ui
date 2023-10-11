import express, { Request, Response } from 'express';
import cors from 'cors';
import { getWeatherData } from '@/Service/weatherDataService';

const app = express();
app.use(cors());

app.get('/api/data', async (req: Request, res: Response) => {
  try {
    const data = await getWeatherData();
    res.json({ data });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
