export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum QuoteStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  OFFER_SENT = 'OFFER_SENT',
  WON = 'WON',
  LOST = 'LOST',
  EXPIRED = 'EXPIRED',
}

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER',
}

export enum StockReason {
  RESTOCK = 'RESTOCK',
  SALE = 'SALE',
  LOST = 'LOST',
  DAMAGE = 'DAMAGE',
  THEFT = 'THEFT',
  CORRECTION = 'CORRECTION',
}

export enum Language {
  AR = 'AR',
  FR = 'FR',
  EN = 'EN',
}
