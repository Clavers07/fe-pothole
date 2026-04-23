'use client';

import { useEffect, useRef, useState } from 'react';

interface MapPickerProps {
    onSelect: (lat: number, lng: number) => void;
    initialLat?: number;
    initialLng?: number;
}

export default function MapPicker({ onSelect, initialLat, initialLng }: MapPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [statusMsg, setStatusMsg] = useState<string>('Klik peta untuk pilih lokasi');

    // useEffect(() => {
    //     if (typeof window === 'undefined' || !mapRef.current) return;

    //     // Avoid double-init
    //     if (mapInstanceRef.current) {
    //         mapInstanceRef.current.remove();
    //         mapInstanceRef.current = null;
    //     }

    //     // Pastikan elemen DOM benar-benar kosong sebelum inisialisasi ulang
    //     if (mapRef.current && mapRef.current.innerHTML !== '') {
    //         mapRef.current.innerHTML = ''; // Bersihkan elemen DOM
    //     }

    //     // Dynamically import Leaflet (SSR-safe)
    //     import('leaflet').then((L) => {
    //         // Fix default icon paths broken by webpack
    //         delete (L.Icon.Default.prototype as any)._getIconUrl;
    //         L.Icon.Default.mergeOptions({
    //             iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    //             iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    //             shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    //         });

    //         const defaultLat = initialLat ?? 1.1301;   // Batam default
    //         const defaultLng = initialLng ?? 104.0529;

    //         const map = L.map(mapRef.current!, {
    //             center: [defaultLat, defaultLng],
    //             zoom: 15,
    //             zoomControl: true,
    //         });

    //         mapInstanceRef.current = map; // Simpan instance peta

    //         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //             attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    //             maxZoom: 19,
    //         }).addTo(map);

    //         // If initial coords provided, drop a marker
    //         if (initialLat && initialLng) {
    //             const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
    //             markerRef.current = marker;

    //             marker.on('dragend', () => {
    //                 const pos = marker.getLatLng();
    //                 onSelect(pos.lat, pos.lng);
    //                 setStatusMsg(`${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`);
    //             });
    //         }

    //         // Click handler
    //         map.on('click', (e: any) => {
    //             const { lat, lng } = e.latlng;

    //             if (markerRef.current) {
    //                 markerRef.current.setLatLng([lat, lng]);
    //             } else {
    //                 const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    //                 markerRef.current = marker;

    //                 marker.on('dragend', () => {
    //                     const pos = marker.getLatLng();
    //                     onSelect(pos.lat, pos.lng);
    //                     setStatusMsg(`${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`);
    //                 });
    //             }

    //             onSelect(lat, lng);
    //             setStatusMsg(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    //         });

    //         // Try to center on user's location on mount
    //         if (!initialLat && !initialLng && navigator.geolocation) {
    //             setIsLocating(true);
    //             setStatusMsg('Mendapatkan lokasi Anda...');
    //             navigator.geolocation.getCurrentPosition(
    //                 (pos) => {
    //                     const { latitude, longitude } = pos.coords;
    //                     map.setView([latitude, longitude], 16);
    //                     setIsLocating(false);
    //                     setStatusMsg('Klik peta untuk pilih lokasi');
    //                 },
    //                 () => {
    //                     setIsLocating(false);
    //                     setStatusMsg('Klik peta untuk pilih lokasi');
    //                 },
    //                 { timeout: 8000 }
    //             );
    //         }
    //     });

    //     return () => {
    //         if (mapInstanceRef.current) {
    //             mapInstanceRef.current.remove();
    //             mapInstanceRef.current = null;
    //             markerRef.current = null;
    //         }
    //     };
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    import('leaflet').then((L) => {

        const defaultLat = initialLat ?? 1.1301;
        const defaultLng = initialLng ?? 104.0529;

        // 🔥 Kalau map SUDAH ADA → jangan init ulang
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([defaultLat, defaultLng], 15);

            // update marker juga kalau ada
            if (markerRef.current && initialLat && initialLng) {
                markerRef.current.setLatLng([initialLat, initialLng]);
            }

            return;
        }

        // 🔥 INIT hanya sekali
        const map = L.map(mapRef.current!, {
            center: [defaultLat, defaultLng],
            zoom: 15,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        let marker: any;

        if (initialLat && initialLng) {
            marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
            markerRef.current = marker;
        }

        map.on('click', (e: any) => {
            const { lat, lng } = e.latlng;

            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else {
                const newMarker = L.marker([lat, lng], { draggable: true }).addTo(map);
                markerRef.current = newMarker;
            }

            onSelect(lat, lng);
        });

        mapInstanceRef.current = map;
    });

}, [initialLat, initialLng]);


    const handleLocateMe = () => {
        if (!navigator.geolocation || !mapInstanceRef.current) return;
        setIsLocating(true);
        setStatusMsg('Mendapatkan lokasi Anda...');

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                mapInstanceRef.current.setView([latitude, longitude], 17);
                setIsLocating(false);
                setStatusMsg('Klik tepat pada lokasi Anda di peta');
            },
            () => {
                setIsLocating(false);
                setStatusMsg('Gagal mendapatkan lokasi');
            },
            { timeout: 8000 }
        );
    };

    return (
        <div className="w-full space-y-2">
            {/* Leaflet CSS */}
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            />

            {/* Map container — fixed height so it never bleeds */}
            <div
                ref={mapRef}
                className="w-full rounded-md border overflow-hidden"
                style={{ height: '280px', zIndex: 0, position: 'relative' }}
            />

            {/* Status bar + locate button */}
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground truncate">
                    {isLocating ? (
                        <span className="animate-pulse">📍 {statusMsg}</span>
                    ) : (
                        <span>📍 {statusMsg}</span>
                    )}
                </p>
                <button
                    type="button"
                    onClick={handleLocateMe}
                    disabled={isLocating}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-md border bg-background hover:bg-muted transition-colors disabled:opacity-50"
                >
                    {isLocating ? 'Mencari...' : '🎯 Lokasi Saya'}
                </button>
            </div>
        </div>
    );
}
