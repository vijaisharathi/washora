export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodeResult {
  address: string;
  coordinates: Coordinates;
  formattedAddress: string;
  postalCode?: string;
  city?: string;
  country?: string;
}

export interface ReverseGeocodeResult {
  coordinates: Coordinates;
  formattedAddress: string;
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface AddressInput {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface AddressValidationResult {
  isValid: boolean;
  standardizedAddress?: AddressInput;
  confidenceScore: number;
  warnings?: string[];
}

export interface DistanceMatrixResult {
  distanceMeters: number;
  durationSeconds: number;
  origin: Coordinates;
  destination: Coordinates;
}

export interface IMapsProvider {
  geocode(address: string): Promise<GeocodeResult>;
  reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResult>;
  validateAddress(address: AddressInput): Promise<AddressValidationResult>;
  calculateDistance(origin: Coordinates, destination: Coordinates): Promise<DistanceMatrixResult>;
}
