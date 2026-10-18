import { analyzeListing, toAIMeta } from "./aiService";
import type { Category, Condition, Listing, ListingStatus } from "./types";

/**
 * Sample listings shown when Firebase isn't configured yet, so the interface
 * can be demonstrated straight after cloning. Never written to the database.
 */
interface Seed {
  title: string;
  description: string;
  category: Category;
  condition?: Condition;
  price: number;
  originalPrice?: number;
  status?: ListingStatus;
  location: string;
  seller: string;
  telegram: string;
  hoursAgo: number;
  expiresInHours?: number;
}

const SEEDS: Seed[] = [
  { title: "Casio fx-570EX calculator", description: "Used for one semester, all functions work. Comes with the hard cover.", category: "PRELOVED", condition: "like_new", price: 55, location: "Village 4", seller: "Aiman", telegram: "aiman_v4", hoursAgo: 0.3 },
  { title: "Nasi lemak ayam berempah", description: "Pre-order for Friday breakfast. Delivered to all villages by 8 am.", category: "FOOD", price: 7, location: "Delivery to your village", seller: "Kak Ros Kitchen", telegram: "kakros_kitchen", hoursAgo: 1, expiresInHours: 30 },
  { title: "Bus ticket Seri Iskandar to TBS", description: "Friday 3 pm, can't travel anymore. Selling at the price I paid.", category: "TICKETS", price: 38, originalPrice: 38, status: "reserved", location: "Main campus", seller: "Mei Ling", telegram: "meiling_tix", hoursAgo: 2, expiresInHours: 50 },
  { title: "Safety boots size 8", description: "Worn for workshop sessions only. Steel toe, soles still thick.", category: "PRELOVED", condition: "good", price: 70, location: "Village 2", seller: "Haziq", telegram: "haziq_mech", hoursAgo: 3 },
  { title: "Thermodynamics textbook, Cengel 9th ed", description: "Some pencil notes in chapter 4, no torn pages. Sem 3 mechanical.", category: "PRELOVED", condition: "good", price: 60, status: "sold", location: "Village 5", seller: "Priya", telegram: "priya_reads", hoursAgo: 5 },
  { title: "Calculus tutoring for foundation", description: "One-to-one sessions on weeknights, past-year paper practice included.", category: "SERVICES", price: 30, location: "Main campus", seller: "Danial", telegram: "danial_tutor", hoursAgo: 6 },
  { title: "Rice cooker 1L", description: "Moving out after convocation. Works perfectly, small scratch on the lid.", category: "PRELOVED", condition: "good", price: 45, status: "sold", location: "Village 1", seller: "Farah", telegram: "farah_moving", hoursAgo: 9 },
  { title: "Burnt cheesecake 6 inch", description: "Pre-order closes Thursday, collect Saturday evening.", category: "FOOD", price: 45, location: "Village 6", seller: "Bake by Nurul", telegram: "bakebynurul", hoursAgo: 12, expiresInHours: 60 },
  { title: "Laptop repair and SSD upgrade", description: "Format, clean the fan, install Windows, upgrade to SSD. Same-day for most jobs.", category: "SERVICES", price: 40, location: "Village 3", seller: "Irfan", telegram: "irfan_fixes", hoursAgo: 20 },
  { title: "Standing fan 16 inch", description: "Three speeds, oscillation works. Self pickup only.", category: "PRELOVED", condition: "fair", price: 35, status: "sold", location: "Village 4", seller: "Wei Jie", telegram: "weijie_utp", hoursAgo: 26 },
  { title: "Study table, foldable", description: "Sturdy, fits the hostel room. Need it gone by Sunday.", category: "PRELOVED", condition: "good", price: 80, location: "Village 2", seller: "Aina", telegram: "aina_v2", hoursAgo: 30 },
  { title: "ETS ticket Ipoh to KL Sentral", description: "Sunday morning, coach C. Name transfer through KTM app.", category: "TICKETS", price: 30, originalPrice: 35, location: "Seri Iskandar town", seller: "Kumar", telegram: "kumar_travels", hoursAgo: 34, expiresInHours: 70 },
];

export function demoListings(now: number = Date.now()): Listing[] {
  return SEEDS.map((s, i) => {
    const analysis = analyzeListing({
      title: s.title,
      description: s.description,
      category: s.category,
      condition: s.condition ?? null,
      price: s.price,
      originalPrice: s.originalPrice ?? null,
    });
    const createdAt = new Date(now - s.hoursAgo * 3_600_000);
    return {
      id: `demo-${i}`,
      title: s.title,
      description: s.description,
      category: s.category,
      tags: analysis.tags,
      condition: s.condition ?? null,
      price: s.price,
      priceUnit: analysis.price.unit,
      originalPrice: s.originalPrice ?? null,
      imageUrl: null,
      location: s.location,
      status: s.status ?? "available",
      sellerId: `demo-seller-${i}`,
      sellerName: s.seller,
      sellerPhoto: null,
      sellerTelegram: s.telegram,
      expiresAt: s.expiresInHours ? new Date(now + s.expiresInHours * 3_600_000) : null,
      createdAt,
      updatedAt: createdAt,
      soldAt: s.status === "sold" ? createdAt : null,
      ai: toAIMeta(analysis),
      impact: analysis.impact,
    };
  });
}
