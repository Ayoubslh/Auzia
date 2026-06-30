import { MOCK_DELIVERY_ITEMS, MOCK_DELIVERY_ORDERS, MOCK_DELIVERY_CATEGORIES } from '../mock';
import type { DeliveryItem, DeliveryOrder, DeliveryCategory } from '../types';

export interface IDeliveryRepository {
  getCategories(): Promise<DeliveryCategory[]>;
  getItems(category?: string): Promise<DeliveryItem[]>;
  getOrders(userId: string): Promise<DeliveryOrder[]>;
  createOrder(order: Omit<DeliveryOrder, 'id' | 'trackingCode' | 'createdAt'>): Promise<DeliveryOrder>;
}

class DeliveryRepository implements IDeliveryRepository {
  private orders: DeliveryOrder[] = [...MOCK_DELIVERY_ORDERS];

  async getCategories(): Promise<DeliveryCategory[]> {
    return Promise.resolve(MOCK_DELIVERY_CATEGORIES);
  }

  async getItems(category?: string): Promise<DeliveryItem[]> {
    if (!category) return Promise.resolve(MOCK_DELIVERY_ITEMS);
    return Promise.resolve(MOCK_DELIVERY_ITEMS.filter((i) => i.category === category));
  }

  async getOrders(userId: string): Promise<DeliveryOrder[]> {
    return Promise.resolve(this.orders.filter((o) => o.senderId === userId));
  }

  async createOrder(order: Omit<DeliveryOrder, 'id' | 'trackingCode' | 'createdAt'>): Promise<DeliveryOrder> {
    const newOrder: DeliveryOrder = {
      ...order,
      id: `order-${Date.now()}`,
      trackingCode: `DZ-TRK-${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`,
      createdAt: new Date().toLocaleDateString('fr-FR'),
    };
    this.orders.push(newOrder);
    return Promise.resolve(newOrder);
  }
}

export const deliveryRepository = new DeliveryRepository();
