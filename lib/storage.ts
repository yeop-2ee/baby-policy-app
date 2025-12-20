// localStorage 유틸리티 함수

export const STORAGE_KEYS = {
  USER_ID: 'baby-policy-user-id',
  USER_PROFILE: 'baby-policy-user-profile',
  BOOKMARKS: 'baby-policy-bookmarks',
} as const;

export function getUserId(): string {
  if (typeof window === 'undefined') return 'default-user';
  
  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  }
  return userId;
}

export function saveUserProfile(profile: any) {
  if (typeof window === 'undefined') return;
  
  const userId = getUserId();
  localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify({
    ...profile,
    userId,
    savedAt: new Date().toISOString(),
  }));
}

export function getUserProfile(): any | null {
  if (typeof window === 'undefined') return null;
  
  const profileStr = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  if (!profileStr) return null;
  
  try {
    return JSON.parse(profileStr);
  } catch {
    return null;
  }
}

export function saveBookmarks(bookmarkIds: string[]) {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarkIds));
}

export function getBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
  
  const bookmarksStr = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
  if (!bookmarksStr) return [];
  
  try {
    return JSON.parse(bookmarksStr);
  } catch {
    return [];
  }
}

export function addBookmark(policyId: string) {
  if (typeof window === 'undefined') return;
  
  const bookmarks = getBookmarks();
  if (!bookmarks.includes(policyId)) {
    bookmarks.push(policyId);
    saveBookmarks(bookmarks);
  }
}

export function removeBookmark(policyId: string) {
  if (typeof window === 'undefined') return;
  
  const bookmarks = getBookmarks().filter(id => id !== policyId);
  saveBookmarks(bookmarks);
}

export function clearUserData() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(STORAGE_KEYS.USER_ID);
  localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
}

