import { BadRequestException, Injectable } from '@nestjs/common';
import {
  REVIEW_VALIDATION,
  ReviewsErrorCode,
} from '../types/reviews.types';

@Injectable()
export class ReviewValidationService {
  /**
   * Validate integer star rating (1 to 5)
   */
  validateRating(rating: unknown): number {
    if (
      typeof rating !== 'number' ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      throw new BadRequestException({
        code: ReviewsErrorCode.INVALID_RATING,
        message: 'Rating must be an integer between 1 and 5',
      });
    }
    return rating;
  }

  /**
   * Validate review title (3 to 120 chars)
   */
  validateTitle(rawTitle: unknown): string {
    if (typeof rawTitle !== 'string') {
      throw new BadRequestException({
        code: ReviewsErrorCode.INVALID_REVIEW_CONTENT,
        message: 'Review title must be a non-empty string',
      });
    }

    const title = rawTitle.trim();
    if (
      title.length < REVIEW_VALIDATION.TITLE_MIN_LENGTH ||
      title.length > REVIEW_VALIDATION.TITLE_MAX_LENGTH
    ) {
      throw new BadRequestException({
        code: ReviewsErrorCode.INVALID_REVIEW_CONTENT,
        message: `Review title must be between ${REVIEW_VALIDATION.TITLE_MIN_LENGTH} and ${REVIEW_VALIDATION.TITLE_MAX_LENGTH} characters`,
      });
    }

    this.checkContentSafety(title, 'title');
    return title;
  }

  /**
   * Validate review comment (10 to 2000 chars)
   */
  validateComment(rawComment: unknown): string {
    if (typeof rawComment !== 'string') {
      throw new BadRequestException({
        code: ReviewsErrorCode.INVALID_REVIEW_CONTENT,
        message: 'Review comment must be a non-empty string',
      });
    }

    const comment = rawComment.trim();
    if (
      comment.length < REVIEW_VALIDATION.COMMENT_MIN_LENGTH ||
      comment.length > REVIEW_VALIDATION.COMMENT_MAX_LENGTH
    ) {
      throw new BadRequestException({
        code: ReviewsErrorCode.INVALID_REVIEW_CONTENT,
        message: `Review comment must be between ${REVIEW_VALIDATION.COMMENT_MIN_LENGTH} and ${REVIEW_VALIDATION.COMMENT_MAX_LENGTH} characters`,
      });
    }

    this.checkContentSafety(comment, 'comment');
    return comment;
  }

  /**
   * Validate provider response comment (3 to 1000 chars)
   */
  validateResponseComment(rawResponse: unknown): string {
    if (typeof rawResponse !== 'string') {
      throw new BadRequestException({
        code: ReviewsErrorCode.INVALID_REVIEW_CONTENT,
        message: 'Provider response must be a non-empty string',
      });
    }

    const comment = rawResponse.trim();
    if (
      comment.length < REVIEW_VALIDATION.RESPONSE_MIN_LENGTH ||
      comment.length > REVIEW_VALIDATION.RESPONSE_MAX_LENGTH
    ) {
      throw new BadRequestException({
        code: ReviewsErrorCode.INVALID_REVIEW_CONTENT,
        message: `Provider response must be between ${REVIEW_VALIDATION.RESPONSE_MIN_LENGTH} and ${REVIEW_VALIDATION.RESPONSE_MAX_LENGTH} characters`,
      });
    }

    this.checkContentSafety(comment, 'response');
    return comment;
  }

  /**
   * Validate moderation reason (3 to 500 chars)
   */
  validateModerationReason(rawReason: unknown): string {
    if (typeof rawReason !== 'string') {
      throw new BadRequestException({
        code: ReviewsErrorCode.REVIEW_MODERATION_REASON_REQUIRED,
        message: 'Moderation reason is required and must be a string',
      });
    }

    const reason = rawReason.trim();
    if (
      reason.length < REVIEW_VALIDATION.MODERATION_REASON_MIN_LENGTH ||
      reason.length > REVIEW_VALIDATION.MODERATION_REASON_MAX_LENGTH
    ) {
      throw new BadRequestException({
        code: ReviewsErrorCode.REVIEW_MODERATION_REASON_REQUIRED,
        message: `Moderation reason must be between ${REVIEW_VALIDATION.MODERATION_REASON_MIN_LENGTH} and ${REVIEW_VALIDATION.MODERATION_REASON_MAX_LENGTH} characters`,
      });
    }

    return reason;
  }

  /**
   * Content Safety: Blocks excessive repeated characters or unbroken strings
   */
  private checkContentSafety(text: string, fieldName: string): void {
    // Check for 8+ identical consecutive characters
    const repeatedCharRegex = /(.)\1{7,}/;
    if (repeatedCharRegex.test(text)) {
      throw new BadRequestException({
        code: ReviewsErrorCode.INVALID_REVIEW_CONTENT,
        message: `Review ${fieldName} contains excessive repeated characters`,
      });
    }

    // Check for unbroken tokens longer than 80 characters
    const words = text.split(/\s+/);
    for (const word of words) {
      if (word.length > 80) {
        throw new BadRequestException({
          code: ReviewsErrorCode.INVALID_REVIEW_CONTENT,
          message: `Review ${fieldName} contains excessively long unbroken character sequences`,
        });
      }
    }
  }
}
