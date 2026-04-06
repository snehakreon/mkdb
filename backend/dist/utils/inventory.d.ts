import { PoolClient } from "pg";
export interface ItemFulfillmentInfo {
    product_id: string;
    product_name: string;
    sku: string;
    quantity_requested: number;
    quantity_from_stock: number;
    quantity_back_order: number;
    in_stock: boolean;
    estimated_delivery_days: number;
    estimated_delivery_date: string;
}
export interface LowStockAlert {
    product_id: string;
    product_name: string;
    sku: string;
    stock_after: number;
    reorder_level: number;
}
export interface InventoryResult {
    fulfillment: ItemFulfillmentInfo[];
    low_stock_alerts: LowStockAlert[];
    has_back_order: boolean;
    expected_delivery_date: string;
}
/**
 * Decrement product stock_qty and log inventory transaction.
 * Never rejects an order — if stock is insufficient, the shortfall
 * is marked as back_order with a 15-20 day delivery timeline.
 * Must be called within an active transaction (PoolClient).
 */
export declare function decrementInventory(client: PoolClient, items: Array<{
    product_id: string;
    quantity: number;
}>, orderId: string, userId?: string): Promise<InventoryResult>;
/**
 * Restore inventory when an order is cancelled.
 * Only restores the quantity_from_stock portion (not back-orders).
 * Must be called within an active transaction (PoolClient).
 */
export declare function restoreInventory(client: PoolClient, orderId: string, userId?: string): Promise<void>;
//# sourceMappingURL=inventory.d.ts.map