import { useEffect, useRef } from 'react';
import type { DeliveryLog } from '../../types';

declare global {
  interface Window {
    L?: any;
  }
}

interface MapProps {
  logs: DeliveryLog[];
}

export default function DeliveryMap({ logs }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  useEffect(() => {
    // 1. Safety Guard: Verify Leaflet core library is loaded on the page window object
    if (!window.L || !mapContainerRef.current) return;

    // 2. Initialize the central map layout if it hasn't been built yet
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(mapContainerRef.current, {
        zoomControl: false
      }).setView([12.7948, 78.7166], 14); // Centered on the Ambur route operational zone

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapInstanceRef.current);

      window.L.control.zoom({ position: 'topright' }).addTo(mapInstanceRef.current);
      markersLayerRef.current = window.L.layerGroup().addTo(mapInstanceRef.current);
    }

    // 3. Force layout dimensions invalidation update to completely fix grey canvas errors
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 300);

    // 4. Wipe old marker layer references completely
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    const markersBounds: any[] = [];

    // 5. Loop through today's delivery data logs and plot coordinates pins
    logs.forEach((log) => {
      const customer = typeof log.customerId === 'object' ? log.customerId : null;
      if (!customer) return;

      // Mathematically spread the households out cleanly using their document ID hashes
      const seed = parseInt(customer._id.substring(18, 24), 16) || 1000;
      const latOffset = ((seed % 100) - 50) * 0.0004;
      const lngOffset = (((seed / 100) % 100) - 50) * 0.0004;
      
      const houseLat = 12.7948 + latOffset;
      const houseLng = 78.7166 + lngOffset;

      markersBounds.push([houseLat, houseLng]);

      // Color-coding mapping logic parameters: Green for delivered, Blue for pending
      const pinColor = log.status === 'delivered' ? '#10b981' : '#2563eb';

      // 🌟 BULLETPROOF REWRITTEN MARKER DRAWING SYSTEM:
      // Uses a native Leaflet vector circle to completely avoid cut-off configuration options
      const marker = window.L.circleMarker([houseLat, houseLng], {
        radius: 8,
        fillColor: pinColor,
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9
      }).bindPopup(`
        <div style="font-family: sans-serif; padding: 2px; min-width: 120px;">
          <strong style="color: #1e293b; font-size: 13px;">${customer.name}</strong>
          <p style="color: #64748b; font-size: 11px; margin: 3px 0 0 0;">${customer.address.street}</p>
          <p style="color: ${log.status === 'delivered' ? '#059669' : '#2563eb'}; font-size: 10px; font-weight: bold; margin-top: 5px; text-transform: uppercase;">
            ${log.status} (${customer.subscription?.defaultQuantity || 1}L)
          </p>
        </div>
      `);

      markersLayerRef.current.addLayer(marker);
    });

    // 6. Automatically framing the screen viewport bounding boxes around active pins
    if (markersBounds.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(markersBounds, { padding: [24, 24], maxZoom: 15 });
    }

  }, [logs]);

  return (
    // Explicit flex-free block layers forcing full rendering visibility dimensions
    <div className="w-full relative block overflow-hidden bg-slate-100 rounded-2xl border border-slate-200/60 shadow-inner" style={{ height: '280px', minHeight: '280px' }}>
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0" style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
