export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}時間${minutes}分`;
  }

  return `${minutes}分`;
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }

  return `${meters} m`;
}

export function estimateDrivingCostYen(distanceMeters: number): number {
  const km = distanceMeters / 1000;
  const fuelCostPerKm = 15;
  const tollEstimatePerKm = 25;

  return Math.round(km * (fuelCostPerKm + tollEstimatePerKm));
}

export function formatYen(amount: number): string {
  return `約 ${amount.toLocaleString("ja-JP")} 円`;
}
