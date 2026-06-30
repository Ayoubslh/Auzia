import { MOCK_ANNOUNCEMENTS } from '../mock';
import type { Announcement, AnnouncementType } from '../types';

export interface IAnnouncementRepository {
  getAnnouncements(type?: AnnouncementType): Promise<Announcement[]>;
  toggleBookmark(id: string): Promise<Announcement>;
}

class AnnouncementRepository implements IAnnouncementRepository {
  private announcements: Announcement[] = [...MOCK_ANNOUNCEMENTS];

  async getAnnouncements(type?: AnnouncementType): Promise<Announcement[]> {
    if (!type) return Promise.resolve(this.announcements);
    return Promise.resolve(this.announcements.filter((a) => a.type === type));
  }

  async toggleBookmark(id: string): Promise<Announcement> {
    const idx = this.announcements.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.announcements[idx] = {
        ...this.announcements[idx],
        isBookmarked: !this.announcements[idx].isBookmarked,
      };
    }
    return Promise.resolve(this.announcements[idx]);
  }
}

export const announcementRepository = new AnnouncementRepository();
