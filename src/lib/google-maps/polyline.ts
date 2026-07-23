export type LatLng = {
  lat: number;
  lng: number;
};

export function decodePolyline(encoded: string): LatLng[] {
  const coordinates: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return coordinates;
}

export function samplePointsAlongPath(points: LatLng[], count: number): LatLng[] {
  if (points.length === 0) {
    return [];
  }

  if (points.length <= count) {
    return points;
  }

  const samples: LatLng[] = [];

  for (let index = 0; index < count; index += 1) {
    const pointIndex = Math.floor((index / (count - 1)) * (points.length - 1));
    samples.push(points[pointIndex]);
  }

  return samples;
}
