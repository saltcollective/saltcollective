import type { SessionAuthObject } from '@clerk/backend';
import type { PendingSessionOptions } from '@clerk/shared/types';
import type { UserType } from '@saltcollective/schema';

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      auth: (options?: PendingSessionOptions) => SessionAuthObject;
      user: {
        id: string;
        username: string | null;
        email: string;
        userType: UserType;
        isActive: boolean;
        lastActiveAt: Date | null;
      } | null;
      requestSpan?: import('@opentelemetry/api').Span;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
