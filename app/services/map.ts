const axios = require('axios');


async function geocodeAddresses(addresses : any) {
  const results = [];
  
  for (const address of addresses) {
    try {
      const response = await axios.get('https://geocode-maps.yandex.ru/v1/', {
        params: {
          apikey: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY,
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