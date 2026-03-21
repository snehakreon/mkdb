export interface Zone {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface Vendor {
  id: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  zone_id?: number;
  is_active: boolean;
  is_verified: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  is_active: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  hsn_code?: string;
  isin?: string;
  category_id?: string;
  brand_id?: string;
  brand_collection?: string;
  vendor_id?: string;
  description?: string;
  unit?: string;
  price: number;
  mrp?: number;
  stock_qty: number;
  min_order_qty: number;
  image_url?: string;
  images?: any[];
  specifications?: Record<string, any>;
  // Dimensions
  length_mm?: number;
  breadth_mm?: number;
  width_mm?: number;
  thickness_mm?: number;
  weight_kg?: number;
  // Box dimensions
  box_length_mm?: number;
  box_breadth_mm?: number;
  box_width_mm?: number;
  box_weight_kg?: number;
  // Attributes
  colour?: string;
  grade?: string;
  material?: string;
  calibration?: string;
  certification?: string;
  termite_resistance?: string;
  warranty?: string;
  country_of_origin?: string;
  customer_care_details?: string;
  tech_sheet_url?: string;
  manufactured_by?: string;
  packaged_by?: string;
  lead_time_days?: number;
  is_active: boolean;
  created_at?: string;
  // Joined fields
  category_name?: string;
  brand_name?: string;
}

export interface Dealer {
  id: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  zone_id?: number;
  is_active: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  shipping_address?: string;
  notes?: string;
  buyer_id?: string;
  dealer_id?: string | null;
  vendor_id?: string | null;
  created_at: string;
  updated_at?: string;
  // Joined fields
  buyer_company?: string;
  buyer_contact?: string;
  dealer_company?: string;
  vendor_company?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name?: string;
  sku?: string;
}

export interface Buyer {
  id: string;
  company_name: string;
  gstin?: string;
  company_type?: string;
  is_active: boolean;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

