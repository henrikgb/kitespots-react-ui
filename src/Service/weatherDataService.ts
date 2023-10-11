const blobRepository = require('./blobRepository');

export const getWeatherData = async () => {
  return await blobRepository.fetchWeatherData();
};

module.exports = {
  getWeatherData
};
