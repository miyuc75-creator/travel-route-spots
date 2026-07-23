"use client";

import { useEffect, useRef, useState } from "react";

import { getRouteColor, getSpotMarkerColor, loadGoogleMaps } from "@/lib/google-maps/load-maps";
import type { RouteOption } from "@/types/route";
import type { RecommendedSpot } from "@/types/spot";

type MapLocation = {
  lat: number;
  lng: number;
  label: string;
};

type RouteMapProps = {
  origin: MapLocation;
  destination: MapLocation;
  selectedRoute: RouteOption | null;
  spots?: RecommendedSpot[];
  selectedSpotId?: string | null;
};

export function RouteMap({
  origin,
  destination,
  selectedRoute,
  spots = [],
  selectedSpotId = null,
}: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      try {
        const google = await loadGoogleMaps();

        if (cancelled || !containerRef.current) {
          return;
        }

        mapRef.current = new google.maps.Map(containerRef.current, {
          center: { lat: origin.lat, lng: origin.lng },
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        setMapReady(true);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "地図の読み込みに失敗しました",
        );
      }
    }

    initializeMap();

    return () => {
      cancelled = true;
    };
  }, [origin.lat, origin.lng]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.google) {
      return;
    }

    const google = window.google;
    const map = mapRef.current;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: origin.lat, lng: origin.lng });
    bounds.extend({ lat: destination.lat, lng: destination.lng });

    const originMarker = new google.maps.Marker({
      map,
      position: { lat: origin.lat, lng: origin.lng },
      title: origin.label,
      label: { text: "A", color: "#ffffff", fontWeight: "700" },
    });

    const destinationMarker = new google.maps.Marker({
      map,
      position: { lat: destination.lat, lng: destination.lng },
      title: destination.label,
      label: { text: "B", color: "#ffffff", fontWeight: "700" },
    });

    markersRef.current = [originMarker, destinationMarker];

    spots.forEach((spot, index) => {
      const isSelected = spot.id === selectedSpotId;
      const marker = new google.maps.Marker({
        map,
        position: { lat: spot.lat, lng: spot.lng },
        title: spot.name,
        label: {
          text: String(index + 1),
          color: "#ffffff",
          fontWeight: "700",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 11 : 9,
          fillColor: getSpotMarkerColor(spot.category, isSelected),
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      markersRef.current.push(marker);
      bounds.extend({ lat: spot.lat, lng: spot.lng });
    });

    if (selectedRoute?.polyline) {
      const path = google.maps.geometry.encoding.decodePath(
        selectedRoute.polyline,
      );

      polylineRef.current = new google.maps.Polyline({
        map,
        path,
        strokeColor: getRouteColor(selectedRoute.mode),
        strokeOpacity: 0.9,
        strokeWeight: 5,
      });

      path.forEach((point) => bounds.extend(point));
    }

    map.fitBounds(bounds, 48);
  }, [mapReady, origin, destination, selectedRoute, spots, selectedSpotId]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="h-80 w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 sm:h-96"
        aria-label="ルート地図"
      />
      <div className="flex flex-wrap gap-3 text-xs text-zinc-600">
        <span>A: {origin.label}</span>
        <span>B: {destination.label}</span>
        {selectedRoute && (
          <span>
            表示中: {selectedRoute.modeLabel} — {selectedRoute.summary}
          </span>
        )}
        {spots.length > 0 && <span>スポット: {spots.length} 件</span>}
      </div>
    </div>
  );
}
