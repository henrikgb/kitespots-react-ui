const express = require('express');
const app = express();
const { BlobServiceClient } = require('@azure/storage-blob');
const cors = require('cors');
require('dotenv').config();


app.use(cors());

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = 'weatherdata';

const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);

app.get('/api/data', async (req, res) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blobClient = containerClient.getBlobClient('latestWeatherData.json');

    const blobContent = await blobClient.downloadToBuffer();
    const data = blobContent.toString('utf-8');

    res.json({ data });
  } catch (error) {
    console.error('Error fetching data from Azure Blob Storage:', error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
