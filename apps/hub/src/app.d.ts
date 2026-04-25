import type { SessionAuthObject, User } from '@clerk/backend';
import type { PendingSessionOptions } from '@clerk/shared/types';
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      auth: (options?: PendingSessionOptions) => SessionAuthObject;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
