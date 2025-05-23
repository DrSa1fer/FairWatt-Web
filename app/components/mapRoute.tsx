"use client"
import { useEffect, useState, useRef, useCallback } from 'react';

interface Point {
  latitude: number;
  longitude: number;
  address?: string;
  buildingType?: string;
  accountId?: number;
  roomsCount?: number;
  residentsCount?: number;
  totalArea?: number;
}

interface MapRouteProps {
  points: Point[];
}

const MapRoute = ({ points }: MapRouteProps) => {
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [startPointIndex, setStartPointIndex] = useState(0);
  const [routeInfo, setRouteInfo] = useState<{distance: string, duration: string} | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const initializedRef = useRef(false);

  const buildRoute = useCallback(() => {
    if (!window.ymaps || !mapInstance.current || !mapContainerRef.current) {
      console.error('Не удалось построить маршрут: отсутствуют необходимые элементы');
      return;
    }

    const ymaps = window.ymaps;
    const map = mapInstance.current;

    try {
      // Очищаем предыдущие объекты
      map.geoObjects.removeAll();

      if (points.length < 2) {
        console.warn('Недостаточно точек для построения маршрута');
        return;
      }

      const sortedPoints = [
        points[startPointIndex],
        ...points.filter((_, index) => index !== startPointIndex)
      ];

      // Создаем мультимаршрут с настройками
      const multiRoute = new ymaps.multiRouter.MultiRoute(
        {
          referencePoints: sortedPoints.map(p => [p.latitude, p.longitude]),
          params: {
            routingMode: 'auto',
            results: 1,
            avoidTrafficJams: true
          }
        },
        {
          boundsAutoApply: true,
          wayPointVisible: false,
          viaPointVisible: false,
          pinVisible: false,
          routeActiveStrokeWidth: 5,
          routeActiveStrokeColor: '#0033ff',
          routeStrokeColor: '#0055ff'
        }
      );

      multiRoute.model.events.add('requestsuccess', () => {
        const activeRoute = multiRoute.getActiveRoute();
        if (activeRoute) {
          setRouteInfo({
            distance: activeRoute.properties.get('distance').text,
            duration: activeRoute.properties.get('duration').text
          });
        }
      });

      multiRoute.model.events.add('requesterror', (error: any) => {
        console.error('Ошибка построения маршрута:', error);
      });

      map.geoObjects.add(multiRoute);

      // Добавляем кастомные метки
      sortedPoints.forEach((point, index) => {
        const placemark = new ymaps.Placemark(
          [point.latitude, point.longitude],
          {
            hintContent: point.address || `Точка ${index + 1}`,
            balloonContent: `
              <div style="max-width: 300px">
                <h3>${point.address || `Точка ${index + 1}`}</h3>
                ${point.buildingType ? `<p><strong>Тип:</strong> ${point.buildingType}</p>` : ''}
                ${point.roomsCount ? `<p><strong>Комнат:</strong> ${point.roomsCount}</p>` : ''}
                ${point.residentsCount ? `<p><strong>Жильцов:</strong> ${point.residentsCount}</p>` : ''}
                ${point.totalArea ? `<p><strong>Площадь:</strong> ${point.totalArea} м²</p>` : ''}
                <button 
                  onclick="document.dispatchEvent(new CustomEvent('setStartPoint', { detail: ${index} }))"
                  style="
                    padding: 5px 10px;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 8px;
                  "
                >
                  Сделать начальной
                </button>
              </div>
            `
          },
          {
            preset: index === 0 ? 'islands#greenDotIcon' : 'islands#blueDotIcon',
            iconColor: index === 0 ? '#00ff00' : '#0033ff'
          }
        );

        placemark.events.add('click', () => {
          setSelectedPoint(point);
        });

        map.geoObjects.add(placemark);
      });

    } catch (error) {
      console.error('Ошибка при построении маршрута:', error);
    }
  }, [points, startPointIndex]);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setStartPointIndex(e.detail);
      setSelectedPoint(null);
    };
    
    document.addEventListener('setStartPoint', handler as EventListener);
    
    return () => {
      document.removeEventListener('setStartPoint', handler as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!window.ymaps || !mapContainerRef.current || initializedRef.current) {
      return;
    }

    console.log('Инициализация карты');
    initializedRef.current = true;

    try {
      mapInstance.current = new window.ymaps.Map(mapContainerRef.current, {
        center: points[0] ? [points[0].latitude, points[0].longitude] : [55.75, 37.62],
        zoom: 14,
        controls: ['zoomControl', 'fullscreenControl']
      });

      // Добавляем элементы управления
      mapInstance.current.controls.add('zoomControl', { float: 'right' });
      mapInstance.current.controls.add('fullscreenControl', { float: 'right' });

      buildRoute();
    } catch (error) {
      console.error('Ошибка инициализации карты:', error);
    }

    return () => {
      if (mapInstance.current) {
        try {
          mapInstance.current.destroy();
        } catch (e) {
          console.error('Ошибка при уничтожении карты:', e);
        }
        mapInstance.current = null;
      }
      initializedRef.current = false;
    };
  }, [buildRoute, points]);

  useEffect(() => {
    if (initializedRef.current) {
      buildRoute();
    }
  }, [buildRoute]);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Шапка с информацией о маршруте */}
      <div style={{ 
        padding: '12px 16px', 
        background: '#f8f9fa', 
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>Оптимальный маршрут</h2>
        
        {routeInfo && (
          <div style={{ display: 'flex', gap: '20px' }}>
            <div><strong>Расстояние:</strong> {routeInfo.distance}</div>
            <div><strong>Время:</strong> {routeInfo.duration}</div>
          </div>
        )}
      </div>

      {/* Основное содержимое - карта */}
      <div style={{ 
        flex: 1, 
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div 
          ref={mapContainerRef} 
          style={{ 
            width: '100%', 
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }} 
        />
      </div>

      {/* Панель выбранной точки */}
      {selectedPoint && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          background: 'white',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>{selectedPoint.address}</h3>
            <button 
              onClick={() => setSelectedPoint(null)}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '20px', 
                cursor: 'pointer',
                color: '#6c757d'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ marginTop: '10px' }}>
            {selectedPoint.buildingType && (
              <p style={{ margin: '4px 0' }}>
                <span style={{ color: '#6c757d' }}>Тип: </span>
                {selectedPoint.buildingType}
              </p>
            )}
            
            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              marginTop: '10px',
              flexWrap: 'wrap'
            }}>
              {selectedPoint.roomsCount !== undefined && (
                <div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>Комнат</div>
                  <div style={{ fontWeight: 'bold' }}>{selectedPoint.roomsCount}</div>
                </div>
              )}
              
              {selectedPoint.residentsCount !== undefined && (
                <div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>Жильцов</div>
                  <div style={{ fontWeight: 'bold' }}>{selectedPoint.residentsCount}</div>
                </div>
              )}
              
              {selectedPoint.totalArea !== undefined && (
                <div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>Площадь</div>
                  <div style={{ fontWeight: 'bold' }}>{selectedPoint.totalArea} м²</div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => {
                const index = points.findIndex(p => 
                  p.latitude === selectedPoint.latitude && 
                  p.longitude === selectedPoint.longitude
                );
                if (index >= 0) {
                  setStartPointIndex(index);
                  setSelectedPoint(null);
                }
              }}
              style={{
                marginTop: '15px',
                padding: '8px 12px',
                width: '100%',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              ⭐ Сделать начальной точкой
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapRoute;