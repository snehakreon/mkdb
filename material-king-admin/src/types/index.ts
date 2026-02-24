export interface Zone {
  id: string;
  zone_code: string;
  zone_name: string;
  is_active: boolean;
  pincodes?: string[];
}

export interface Vendor {
  id: string;
  vendor_code: string;
  company_name: string;
  gstin: string;
  contact_person_name: string;
  contact_phone: string;
  contact_email: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_active: boolean;
}

export interface Category {
  id: string;
  category_name: string;
  slug: string;
  is_active: boolean;
}

export interface Brand {
  id: string;
  brand_name: string;
  slug: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  sku: string;
  product_name: string;
  category_id: string;
  brand_id?: string;
  is_active: boolean;
}

export interface Dealer {
  id: string;
  dealer_code: string;
  company_name: string;
  contact_person_name: string;
  contact_phone: string;
  credit_limit: number;
  available_credit: number;
  approval_status: 'pending' | 'approved' | 'rejected';
}

export interface Order {
  id: string;
  order_number: string;
  buyer_name: string;
  order_type: 'direct' | 'dealer';
  order_status: string;
  total_amount: number;
  created_at: string;
}
