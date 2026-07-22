export type GeocodedLocation = {
  input: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  placeId: string;
};

export type RouteSearchInput = {
  origin: string;
  destination: string;
};

export type ValidatedRouteSearch = {
  origin: GeocodedLocation;
  destination: GeocodedLocation;
};
