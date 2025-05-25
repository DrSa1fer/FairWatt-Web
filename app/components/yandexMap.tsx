"use client";

import { useEffect, useRef } from 'react';

interface YandexMapProps {
    latitude: number;
    longitude: number;
}

export default function YandexMap({ latitude, longitude }: YandexMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!window.ymaps || !mapRef.current) return;

        window.ymaps.ready(() => {
            new window.ymaps.Map(mapRef.current, {
                center: [latitude, longitude],
                zoom: 17,
                controls: ['zoomControl', 'fullscreenControl']
            });
        });
    }, [latitude, longitude]);

    return <div ref={mapRef} style={{ width: '100%', height: '400px' }} />;
}