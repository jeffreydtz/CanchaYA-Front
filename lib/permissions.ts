/**
 * Permission Helper Functions for CanchaYA
 *
 * CRITICAL RULES (from backend documentation):
 * ❌ NEVER use rol === 'admin' for permission checks
 * ✅ ALWAYS use nivelAcceso for access control
 * ✅ ALWAYS use clubIds for filtering data (admin-club users)
 *
 * Permission Hierarchy:
 * - usuario: Can only reserve and view their own reservations
 * - admin-club: Can manage reservations and metrics for their assigned clubs
 * - admin: Full system access
 */

export type NivelAcceso = 'usuario' | 'admin-club' | 'admin'

/**
 * Check if user is a global admin
 */
export function isGlobalAdmin(nivelAcceso: NivelAcceso | null | undefined): boolean {
  return nivelAcceso === 'admin'
}

/**
 * Check if user is a club admin
 */
export function isClubAdmin(nivelAcceso: NivelAcceso | null | undefined): boolean {
  return nivelAcceso === 'admin-club'
}

/**
 * Check if user has any admin privileges (club or global)
 */
export function hasAdminPrivileges(nivelAcceso: NivelAcceso | null | undefined): boolean {
  return nivelAcceso === 'admin' || nivelAcceso === 'admin-club'
}

/**
 * Check if user is a regular user (no admin privileges)
 */
export function isRegularUser(nivelAcceso: NivelAcceso | null | undefined): boolean {
  return nivelAcceso === 'usuario'
}

/**
 * Check if user has access to a specific club
 * - Global admins have access to ALL clubs
 * - Club admins only have access to their assigned clubs
 * - Regular users have no club-level access
 */
export function hasClubAccess(
  nivelAcceso: NivelAcceso | null | undefined,
  clubIds: string[],
  targetClubId: string
): boolean {
  if (nivelAcceso === 'admin') return true // Global admin
  if (nivelAcceso === 'admin-club') return clubIds.includes(targetClubId)
  return false
}

/**
 * Filter clubs based on user's access level
 * - Global admins see all clubs
 * - Club admins see only their assigned clubs
 * - Regular users see no clubs (empty array)
 */
export function filterClubsByAccess(
  nivelAcceso: NivelAcceso | null | undefined,
  clubIds: string[],
  allClubs: { id: string; [key: string]: any }[]
): typeof allClubs {
  if (nivelAcceso === 'admin') return allClubs // Global admin sees all
  if (nivelAcceso === 'admin-club') {
    return allClubs.filter(club => clubIds.includes(club.id))
  }
  return [] // Regular users see no clubs
}

/**
 * Check if user can create reservations
 * All authenticated users can create reservations
 */
export function canCreateReservation(nivelAcceso: NivelAcceso | null | undefined): boolean {
  return nivelAcceso !== null && nivelAcceso !== undefined
}

/**
 * Check if user can assign reservations to other users
 * Only admins (club or global) can assign reservations
 */
export function canAssignReservation(nivelAcceso: NivelAcceso | null | undefined): boolean {
  return hasAdminPrivileges(nivelAcceso)
}

/**
 * Check if user can confirm reservations
 * - Regular users can confirm their own reservations
 * - Admins can confirm any reservation (with scope for club admins)
 */
export function canConfirmReservation(
  nivelAcceso: NivelAcceso | null | undefined,
  clubIds: string[],
  reservationClubId: string,
  reservationOwnerId: string,
  currentUserId: string
): boolean {
  // Owner can always confirm their own reservation
  if (reservationOwnerId === currentUserId) return true

  // Global admin can confirm any reservation
  if (nivelAcceso === 'admin') return true

  // Club admin can confirm reservations for their clubs
  if (nivelAcceso === 'admin-club') {
    return clubIds.includes(reservationClubId)
  }

  return false
}

/**
 * Check if user can cancel reservations
 * Same rules as confirmation
 */
export function canCancelReservation(
  nivelAcceso: NivelAcceso | null | undefined,
  clubIds: string[],
  reservationClubId: string,
  reservationOwnerId: string,
  currentUserId: string
): boolean {
  return canConfirmReservation(nivelAcceso, clubIds, reservationClubId, reservationOwnerId, currentUserId)
}

/**
 * Check if user can view admin dashboard
 */
export function canViewAdminDashboard(nivelAcceso: NivelAcceso | null | undefined): boolean {
  return hasAdminPrivileges(nivelAcceso)
}

/**
 * Check if user can manage canchas (courts)
 * Only admins (club or global) can manage canchas
 */
export function canManageCanchas(nivelAcceso: NivelAcceso | null | undefined): boolean {
  return hasAdminPrivileges(nivelAcceso)
}

/**
 * Check if user can manage clubs
 * Only global admins can manage clubs
 */
export function canManageClubs(nivelAcceso: NivelAcceso | null | undefined): boolean {
  return isGlobalAdmin(nivelAcceso)
}

/**
 * Check if user can view metrics
 * Admins can view metrics (scoped by clubIds for club admins)
 */
export function canViewMetrics(nivelAcceso: NivelAcceso | null | undefined): boolean {
  return hasAdminPrivileges(nivelAcceso)
}

/**
 * Get the scope of data access for admin queries
 * Returns clubIds for filtering, or null for global access
 */
export function getAdminDataScope(
  nivelAcceso: NivelAcceso | null | undefined,
  clubIds: string[]
): string[] | null {
  if (nivelAcceso === 'admin') return null // No filter - global access
  if (nivelAcceso === 'admin-club') return clubIds // Filter by clubIds
  return [] // No access
}

/**
 * Display-friendly permission level name
 */
export function getPermissionLevelName(nivelAcceso: NivelAcceso | null | undefined): string {
  switch (nivelAcceso) {
    case 'admin':
      return 'Administrador Global'
    case 'admin-club':
      return 'Administrador de Club'
    case 'usuario':
      return 'Usuario'
    default:
      return 'Sin permisos'
  }
}
