import { Injectable, Logger } from '@nestjs/common';
import {
  AddressInput,
  AddressValidationResult,
  Coordinates,
  DistanceMatrixResult,
  GeocodeResult,
  IMapsProvider,
  ReverseGeocodeResult,
} from './maps-provider.interface';

@Injectable()
export class MockMapsProviderService implements IMapsProvider {
  private readonly logger = new Logger(MockMapsProviderService.name);

  async geocode(address: string): Promise<GeocodeResult> {
    this.logger.log(`[MockMaps] Geocoding address "${address}"`);
    // Return deterministic mock coordinates (e.g. central Mumbai)
    return {
      address,
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777,
      },
      formattedAddress: address,
      postalCode: '400001',
      city: 'Mumbai',
      country: 'India',
    };
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResult> {
    this.logger.log(`[MockMaps] Reverse geocoding coords (${latitude}, ${longitude})`);
    return {
      coordinates: { latitude, longitude },
      formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}, Central District, Mumbai, MH, 400001`,
      street: 'Market Road',
      city: 'Mumbai',
      postalCode: '400001',
      country: 'India',
    };
  }

  async validateAddress(address: AddressInput): Promise<AddressValidationResult> {
    const isValid = Boolean(address.street && address.city && address.postalCode);
    return {
      isValid,
      standardizedAddress: isValid ? { ...address } : undefined,
      confidenceScore: isValid ? 0.95 : 0.2,
      warnings: isValid ? [] : ['Missing mandatory address fields'],
    };
  }

  async calculateDistance(origin: Coordinates, destination: Coordinates): Promise<DistanceMatrixResult> {
    // Haversine formula
    const R = 6371e3; // Earth radius in meters
    const phi1 = (origin.latitude * Math.PI) / 180;
    const phi2 = (destination.latitude * Math.PI) / 180;
    const deltaPhi = ((destination.latitude - origin.latitude) * Math.PI) / 180;
    const deltaLambda = ((destination.longitude - origin.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distanceMeters = Math.round(R * c);
    // Approximate speed 30 km/h = 8.33 m/s in city
    const durationSeconds = Math.round(distanceMeters / 8.33);

    return {
      distanceMeters,
      durationSeconds,
      origin,
      destination,
    };
  }
}
