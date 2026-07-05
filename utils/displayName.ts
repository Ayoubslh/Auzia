import type { User } from '../types';

export function getDisplayName(user: Pick<User, 'nickname' | 'firstName' | 'lastName' | 'nameDisplayMode'>): string {
  if (user.nameDisplayMode === 'fullname') {
    const full = `${user.firstName} ${user.lastName}`.trim();
    if (full) return full;
  }
  return user.nickname || `${user.firstName} ${user.lastName}`.trim();
}
