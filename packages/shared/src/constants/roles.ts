// Role enum — canonical source is Prisma schema.
// Re-export from @zuroy/database once generated.
// These are kept here temporarily for use before Prisma client is available.
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HOTEL_STAFF: 'HOTEL_STAFF',
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];
