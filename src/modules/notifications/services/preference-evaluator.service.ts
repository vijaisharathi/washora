import { Injectable } from '@nestjs/common';
import {
  CommunicationChannel,
  NotificationCategory,
  NotificationCategoryType,
  NotificationTypeCategoryMap,
} from '../types/notifications.types';

export interface UserPreferencesLike {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  pushEnabled: boolean;
  orderUpdates: boolean;
  marketingOffers: boolean;
  systemAlerts: boolean;
  categories?: any;
}

@Injectable()
export class PreferenceEvaluatorService {
  /**
   * Determine whether a notification should be delivered to a user via a given channel.
   * Enforces mandatory Security & System Alert bypass: Security events can NEVER be disabled.
   */
  shouldDeliver(
    notificationType: string,
    channel: CommunicationChannel,
    preferences: UserPreferencesLike | null,
  ): boolean {
    const category: NotificationCategoryType =
      NotificationTypeCategoryMap[notificationType] || NotificationCategory.SYSTEM;

    // MANDATORY SECURITY & SYSTEM EVENT BYPASS:
    // Security & critical system notifications bypass user opt-outs across all active channels!
    if (category === NotificationCategory.SECURITY) {
      return true;
    }

    // If no preferences record exists, allow default channels (in-app, email, whatsapp, push)
    if (!preferences) {
      if (channel === CommunicationChannel.SMS) return false;
      return true;
    }

    // 1. Check Channel Preferences
    let channelAllowed = true;
    switch (channel) {
      case CommunicationChannel.IN_APP:
        channelAllowed = preferences.inAppEnabled;
        break;
      case CommunicationChannel.EMAIL:
        channelAllowed = preferences.emailEnabled;
        break;
      case CommunicationChannel.SMS:
        channelAllowed = preferences.smsEnabled;
        break;
      case CommunicationChannel.WHATSAPP:
        channelAllowed = preferences.whatsappEnabled;
        break;
      case CommunicationChannel.PUSH:
        channelAllowed = preferences.pushEnabled;
        break;
      case CommunicationChannel.INTERNAL_MEMO:
        channelAllowed = true;
        break;
      default:
        channelAllowed = true;
    }

    if (!channelAllowed) {
      return false;
    }

    // 2. Check Category Preferences
    if (category === NotificationCategory.SYSTEM) {
      return preferences.systemAlerts;
    }

    if (category === NotificationCategory.BOOKING || category === NotificationCategory.ASSIGNMENT) {
      if (!preferences.orderUpdates) return false;
    }

    if (category === NotificationCategory.PROMOTIONS) {
      if (!preferences.marketingOffers) return false;
    }

    // 3. Check granular category override if present
    if (preferences.categories && typeof preferences.categories === 'object') {
      const catMap = preferences.categories as Record<string, boolean>;
      if (catMap[category] !== undefined) {
        return catMap[category];
      }
    }

    return true;
  }
}
