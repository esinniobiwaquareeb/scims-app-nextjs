/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

export interface DemoRestriction {
  action: string;
  allowed: boolean;
  message: string;
}

export const DEMO_RESTRICTIONS: Record<string, DemoRestriction> = {
  delete: {
    action: 'delete',
    allowed: false,
    message: 'Delete operations are not allowed in demo mode. This is a read-only demonstration.'
  },
  create: {
    action: 'create',
    allowed: true,
    message: 'Create operations are allowed in demo mode for demonstration purposes.'
  },
  update: {
    action: 'update',
    allowed: true,
    message: 'Update operations are allowed in demo mode for demonstration purposes.'
  },
  read: {
    action: 'read',
    allowed: true,
    message: 'Read operations are always allowed.'
  }
};

export function checkDemoRestrictions(user: any, action: string): { allowed: boolean; message?: string } {
  if (!user?.isDemo) {
    return { allowed: true };
  }

  const restriction = DEMO_RESTRICTIONS[action];
  if (!restriction) {
    return { allowed: true };
  }

  return {
    allowed: restriction.allowed,
    message: restriction.message
  };
}

export function createDemoRestrictedResponse(message: string, status: number = 403) {
  return NextResponse.json(
    { 
      success: false, 
      error: message,
      isDemoRestriction: true
    },
    { status }
  );
}

export function isDemoUser(user: any): boolean {
  return user?.isDemo === true;
}

export function getDemoRestrictionMessage(action: string): string {
  const restriction = DEMO_RESTRICTIONS[action];
  return restriction?.message || 'This action is not allowed in demo mode.';
}
