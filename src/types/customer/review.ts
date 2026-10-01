export interface CustomerReviewData {
  id: string;
  orderId: string;
  serviceId?: string;
  serviceName: string;
  providerName: string;
  rating: number;
  ratingLabel?: string;
  comment?: string;
  tags?: string[];
  createdAt: string;
}

export interface SubmitReviewPayload {
  orderId: string;
  rating: number;
  comment?: string;
  tags?: string[];
}
