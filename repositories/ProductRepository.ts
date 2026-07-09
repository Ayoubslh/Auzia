import { supabase } from '../supabase/client';
import type { Product, ProductFilter, ProductItem, Dish } from '../types';

export interface IProductRepository {
  getProducts(filter?: ProductFilter): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  addProduct(product: Omit<Product, 'id'>): Promise<Product>;
}

function toProduct(row: any): Product {
  return {
    id:           row.id,
    kind:         row.kind,
    title:        row.title,
    description:  row.description ?? '',
    category:     row.category,
    emoji:        row.emoji ?? undefined,
    tags:         row.tags ?? [],
    imageUrl:     row.image_url ?? undefined,
    address:      row.address ?? undefined,
    city:         row.city ?? '',
    country:      row.country ?? '',
    countryFlag:  row.country_flag ?? '',
    cities:       row.cities ?? [],
    latitude:     row.latitude ?? 0,
    longitude:    row.longitude ?? 0,
    contactPhone: row.contact_phone ?? undefined,
    contactEmail: row.contact_email ?? undefined,
    website:      row.website ?? undefined,
    rating:       row.rating ?? undefined,
    reviewCount:  row.review_count ?? 0,
    addedBy:      row.added_by ?? '',
    items:        (row.product_items ?? []).map((i: any): ProductItem => ({
      id: i.id, name: i.name, emoji: i.emoji, description: i.description ?? undefined,
    })),
    dishes:       (row.product_dishes ?? []).map((d: any): Dish => ({
      id: d.id, name: d.name, emoji: d.emoji, description: d.description ?? undefined,
    })),
    availableAt:  [],
  };
}

class ProductRepository implements IProductRepository {
  async getProducts(filter?: ProductFilter): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*, product_items(*), product_dishes(*)');

    if (filter?.country)  query = query.eq('country', filter.country);
    if (filter?.city)     query = query.or(`city.eq.${filter.city},cities.cs.{${filter.city}}`);
    if (filter?.category) query = query.eq('category', filter.category);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toProduct);
  }

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_items(*), product_dishes(*)')
      .eq('id', id)
      .single();
    if (error) return null;
    return toProduct(data);
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        kind:          product.kind,
        title:         product.title,
        description:   product.description,
        category:      product.category,
        emoji:         product.emoji,
        tags:          product.tags ?? [],
        image_url:     product.imageUrl,
        address:       product.address,
        city:          product.city,
        country:       product.country,
        country_flag:  product.countryFlag,
        cities:        product.cities ?? [],
        latitude:      product.latitude,
        longitude:     product.longitude,
        contact_phone: product.contactPhone,
        contact_email: product.contactEmail,
        website:       product.website,
        added_by:      product.addedBy,
      })
      .select('id')
      .single();

    if (error) throw error;
    // Construct the return value from known data to avoid a second multi-join SELECT
    // (caller doesn't use the returned product anyway)
    return {
      id:          data.id,
      kind:        product.kind,
      title:       product.title,
      description: product.description,
      category:    product.category,
      emoji:       product.emoji,
      tags:        product.tags ?? [],
      imageUrl:    product.imageUrl,
      address:     product.address,
      city:        product.city,
      country:     product.country,
      countryFlag: product.countryFlag,
      cities:      product.cities ?? [],
      latitude:    product.latitude,
      longitude:   product.longitude,
      contactPhone: product.contactPhone,
      contactEmail: product.contactEmail,
      website:     product.website,
      rating:      undefined,
      reviewCount: 0,
      addedBy:     product.addedBy,
      items:       [],
      dishes:      [],
      availableAt: [],
    };
  }
}

export const productRepository = new ProductRepository();
