"use client"
import { useEffect, useState, useRef, useCallback } from 'react';
import MapRoute from '../components/mapRoute';

const points = [
  {
    latitude: 45.001245,
    longitude: 37.331763,
    address: "Краснодарский край, р-н Анапский, село Витязево, проезд Летний, д. 2 А",
    accountId: 1080,
    buildingType: "Частный",
    roomsCount: 3,
    residentsCount: 3
  },
  {
    latitude: 44.892514,
    longitude: 37.343721,
    address: "Краснодарский край, р-н Анапский, с Супсех, ул Цветочная, д. 28",
    accountId: 1082,
    buildingType: "Частный",
    roomsCount: 3,
    residentsCount: 3,
    totalArea: 825.80
  },
  {
    latitude: 45.001578,
    longitude: 37.335892,
    address: "Краснодарский край, р-н Анапский, село Витязево, ул Горького, д. 33",
    accountId: 1083,
    buildingType: "Частный",
    roomsCount: 3,
    residentsCount: 3
  },
  // {
  //   latitude: 44.364812,
  //   longitude: 38.525463,
  //   address: "Краснодарский край, г Геленджик, с Архипо-Осиповка, ул Ленина, д. 94",
  //   accountId: 1084,
  //   buildingType: "Частный",
  //   roomsCount: 1,
  //   residentsCount: 3
  // },
  {
    latitude: 45.008765,
    longitude: 37.328901,
    address: "Краснодарский край, р-н Анапский, село Витязево, ул Золотые пески, д. 5",
    accountId: 1086,
    buildingType: "Частный",
    roomsCount: 3,
    residentsCount: 1,
    totalArea: 1024.80
  },
  // {
  //   latitude: 44.367231,
  //   longitude: 38.523456,
  //   address: "Краснодарский край, г Геленджик, с Архипо-Осиповка, ул Кирпичная, д. 1 а",
  //   accountId: 1088,
  //   buildingType: "Частный",
  //   roomsCount: 3,
  //   residentsCount: 3,
  //   totalArea: 257.90
  // },
  // {
  //   latitude: 44.857312,
  //   longitude: 38.876543,
  //   address: "Краснодарский край, р-н Северский, ст-ца Новодмитриевская, ул Садовая, д. 20",
  //   accountId: 1247,
  //   buildingType: "Прочий"
  // }
];

// Глобальное состояние загрузки API
declare global {
  interface Window {
    _ymapsLoaded?: boolean;
    ymaps: any;
  }
}

const MapPage = () => {
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    if (window._ymapsLoaded) {
      setApiReady(true);
      return;
    }

    if (!window._ymapsLoaded && !document.querySelector('script[src*="api-maps.yandex.ru"]')) {
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?` + process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY + `&lang=ru_RU&load=package.full`;
      script.onload = () => {
        window.ymaps.ready(() => {
          window._ymapsLoaded = true;
          setApiReady(true);
        });
      };
      document.head.appendChild(script);
    }

    return () => {
      // Очистка при необходимости
    };
  }, []);

  if (!apiReady) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <h1>Загрузка карты...</h1>
        <div style={{
          width: '200px',
          height: '4px',
          backgroundColor: '#f0f0f0',
          borderRadius: '2px',
          marginTop: '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#4CAF50',
            animation: 'loading 1.5s infinite ease-in-out',
            transformOrigin: 'left center'
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ padding: '20px' }}>Оптимальный маршрут</h1>
      <div style={{ flex: 1, position: 'relative' }}>
        <MapRoute points={points} />
      </div>
    </div>
  );
};

export default MapPage;