import { ServiceItem, ServiceVariant, ProviderSummary, ServiceCategory } from "./index";

export interface ServiceInclusion {
  title: string;
  included: boolean;
}

export interface ServiceDetailFaq {
  q: string;
  a: string;
}

export interface ServiceDetailData extends ServiceItem {
  categoryName: string;
  categorySlug: string;
  galleryImages: string[];
  longDescription: string;
  rating: number;
  reviewCount: number;
  turnaroundEstimate: string;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  inclusions: string[];
  exclusions: string[];
  processSteps: { step: number; title: string; description: string }[];
  faqs: ServiceDetailFaq[];
  assignedProvider: ProviderSummary;
  relatedServices: ServiceItem[];
}
