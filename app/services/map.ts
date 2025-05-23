const axios = require('axios');
const API_KEY = 'e11435b1-e889-4652-9c53-6669d6fea872';

async function geocodeAddresses(addresses : any) {
  const results = [];
  
  for (const address of addresses) {
    try {
      const response = await axios.get('https://geocode-maps.yandex.ru/v1/', {
        params: {
          apikey: API_KEY,
          geocode: address,
          format: 'json'
        }
      });
      
      const feature = response.data.response.GeoObjectCollection.featureMember[0]?.GeoObject;
      if (feature) {
        const [longitude, latitude] = feature.Point.pos.split(' ');
        results.push({
          originalAddress: address,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          formattedAddress: feature.name
        });
      }
    } catch (error : any) {
      console.error(`Ошибка при декодировании адреса: ${address}:`, error.message);
    }
  }
  
  return results;
}

// Использование
//const addresses = ["Краснодарский край, р-н Анапский, село Витязево, проезд Летний, д. 2 А"];
//geocodeAddresses(addresses).then(console.log);