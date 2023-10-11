const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = 'weatherdata';
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

const fetchWeatherData = async () => {
  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
  const blobClient = containerClient.getBlobClient('latestWeatherData.json');
  const blobContent = await blobClient.downloadToBuffer();
  return blobContent.toString('utf-8');
};

module.exports = {
  fetchWeatherData
};
