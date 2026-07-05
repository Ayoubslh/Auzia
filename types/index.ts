// ─── User ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  nickname: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  avatarInitials: string;
  avatarColor: string;
  countryOfOrigin: string;
  countryOfOriginFlag: string;
  countryOfResidence: string;
  countryOfResidenceFlag: string;
  cityOfResidence: string;
  workField: string;
  status?: string;
  phoneNumber?: string;
  linkedin?: string;
  instagram?: string;
  aboutMe?: string;
  connectionCount: number;
  countriesCount: number;
  memberSince: string;
  latitude: number;
  longitude: number;
  isLookingForOpportunities?: boolean;
  commonConnections?: number;
  showOnMap: boolean;
  allowChat: boolean;
  nameDisplayMode: 'nickname' | 'fullname';
}

export interface CurrentUser extends User {
  isAuthenticated: boolean;
}

// ─── Connection ──────────────────────────────────────────────────────────────

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

export interface ConnectionUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarInitials: string;
  avatarColor: string;
  nickname: string;
  nameDisplayMode: 'nickname' | 'fullname';
}

export interface Connection {
  id: string;
  senderId: string;
  receiverId: string;
  note?: string;
  status: ConnectionStatus;
  createdAt: string;
  receiverUser?: ConnectionUser;
}

// ─── Message ─────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage: Message;
  unreadCount: number;
}

// ─── Product / Business ──────────────────────────────────────────────────────

export type ProductCategory = 'Épicerie' | 'Restaurant' | 'Service' | 'Boutique' | 'Autre';

export type ProductKind = 'store' | 'brand';

export interface ProductItem {
  id: string;
  name: string;
  emoji: string;
  description?: string;
}

export interface Dish {
  id: string;
  name: string;
  emoji: string;
  description?: string;
}

export interface Product {
  id: string;
  kind: ProductKind;
  title: string;
  description: string;
  category: ProductCategory;
  emoji?: string;
  tags?: string[];
  imageUrl?: string;
  address?: string;
  city: string;
  country: string;
  countryFlag: string;
  cities?: string[];
  latitude: number;
  longitude: number;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  addedBy: string;
  items?: ProductItem[];   // for stores: Algerian products they carry
  dishes?: Dish[];         // for restaurants: Algerian dishes they serve
  availableAt?: string[];  // for brands: store product IDs where available
}

// ─── Announcement ────────────────────────────────────────────────────────────

export type AnnouncementType = 'Événements' | 'Réductions' | 'Activités' | 'Offres';

export interface Announcement {
  id: string;
  type: AnnouncementType;
  title: string;
  description: string;
  date: string;
  location: string;
  locationFlag: string;
  imageUrl?: string;
  discount?: string;
  code?: string;
  isBookmarked?: boolean;
  isLiked?: boolean;
  author?: string;
  emoji?: string;
}

// ─── Delivery ────────────────────────────────────────────────────────────────

export type DeliveryStatus = 'pending' | 'accepted' | 'in_transit' | 'delivered';

export interface DeliveryItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  emoji: string;
  rating: number;
  isBestseller?: boolean;
  imageEmoji?: string;
}

export interface DeliveryOrder {
  id: string;
  item: DeliveryItem;
  senderId: string;
  receiverName: string;
  receiverCity: string;
  status: DeliveryStatus;
  estimatedDelivery: string;
  createdAt: string;
  trackingCode: string;
}

export type DeliveryCategory = {
  id: string;
  name: string;
  emoji: string;
};

// ─── Notification ────────────────────────────────────────────────────────────

export type NotificationType = 'connection_request' | 'message' | 'announcement';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  content: string;
  read: boolean;
  createdAt: string;
  actionUserId?: string;
  connectionId?: string;
  actorInitials?: string;
  actorColor?: string;
}

// ─── Service / Facture ───────────────────────────────────────────────────────

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  route: string;
}

export interface PaymentRecord {
  id: string;
  service: string;
  amount: number;
  currency: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface DiasporaFilter {
  country?: string;
  countryFlag?: string;
  city?: string;
  domain?: string;
  status?: string;
}

export interface ProductFilter {
  country?: string;
  countryFlag?: string;
  city?: string;
  category?: string;
}
