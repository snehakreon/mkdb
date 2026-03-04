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
  category_code: string;
  is_active: boolean;
}

export interface Brand {
  id: string;
  brand_name: string;
  brand_code: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  sku_code: string;
  product_name: string;
  category_id: string;
  brand_id?: string;
  description?: string;
  specifications?: Record<string, any>;
  hsn_code?: string;
  weight_kg?: number;
  length_ft?: number;
  width_ft?: number;
  height_ft?: number;
  cbm_per_unit?: number;
  tech_sheet_url?: string;
  is_active: boolean;
  // Joined fields
  category_name?: string;
  brand_name?: string;
}

export interface Dealer {
  id: string;
  dealer_code: string;
  company_name: string;
  gstin: string;
  pan: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  bank_name?: string;
  bank_branch?: string;
  credit_limit: number;
  available_credit: number;
  credit_payment_terms_days: number;
  approval_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  business_address?: string;
  contact_phone: string;
  contact_email: string;
}

export interface Order {
  id: string;
  order_number: string;
  order_type: 'direct' | 'dealer';
  order_status: string;
  payment_status: string;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  delivery_address: string;
  delivery_pincode: string;
  delivery_contact_name?: string;
  delivery_contact_phone?: string;
  expected_delivery_date?: string | null;
  actual_delivery_date?: string | null;
  buyer_notes?: string;
  admin_notes?: string;
  cancellation_reason?: string;
  buyer_id: string;
  project_id: string;
  dealer_id?: string | null;
  zone_id: string;
  assigned_vendor_id?: string | null;
  created_at: string;
  // Joined fields
  buyer_company?: string;
  project_name?: string;
  dealer_company?: string;
  dealer_code?: string;
  vendor_company?: string;
  vendor_code?: string;
  zone_name?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  product_name?: string;
  sku_code?: string;
  product_name_snapshot?: string;
  sku_code_snapshot?: string;
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

export interface Project {
  id: string;
  project_name: string;
  project_code: string;
  delivery_address: string;
  delivery_pincode: string;
  delivery_city?: string;
  delivery_state?: string;
  site_manager_name?: string;
  site_manager_phone?: string;
  is_active: boolean;
}
