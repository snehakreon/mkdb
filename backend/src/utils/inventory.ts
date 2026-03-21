import { PoolClient } from "pg";

export interface LowStockAlert {
  product_id: string;
  product_name: string;
  sku: string;
  stock_after: number;
  reorder_level: number;
}

/**
 * Decrement product stock_qty and log inventory transaction.
 * Returns low-stock alerts for items that fell below threshold.
 * Must be called within an active transaction (PoolClient).
 */
export async function decrementInventory(
  client: PoolClient,
  items: Array<{ product_id: string; quantity: number }>,
  orderId: string,
  userId?: string
): Promise<LowStockAlert[]> {
  const alerts: LowStockAlert[] = [];

  for (const item of items) {
    // Lock the product row and check stock
    const productResult = await client.query(
      `SELECT id, name, sku, stock_qty, min_order_qty
       FROM products WHERE id = $1 FOR UPDATE`,
      [item.product_id]
    );

    if (productResult.rows.length === 0) {
      throw new Error(`Product ${item.product_id} not found`);
    }

    const product = productResult.rows[0];
    const stockBefore = product.stock_qty || 0;

    if (stockBefore < item.quantity) {
      throw new Error(
        `Insufficient stock for "${product.name}" (SKU: ${product.sku}). Available: ${stockBefore}, Requested: ${item.quantity}`
      );
    }

    const stockAfter = stockBefore - item.quantity;

    // Decrement stock on product
    await client.query(
      `UPDATE products SET stock_qty = $1, updated_at = NOW() WHERE id = $2`,
      [stockAfter, item.product_id]
    );

    // Log inventory transaction
    await client.query(
      `INSERT INTO inventory_transactions
         (product_id, transaction_type, quantity_change, quantity_before, quantity_after,
          reason, reference_type, reference_id, created_by)
       VALUES ($1, 'reduce', $2, $3, $4, $5, 'order', $6, $7)`,
      [
        item.product_id,
        -item.quantity,
        stockBefore,
        stockAfter,
        `Order ${orderId} placed`,
        orderId,
        userId || null,
      ]
    );

    // Check for low stock (default reorder level: 10)
    const DEFAULT_REORDER_LEVEL = 10;

    // Try to get reorder level from inventory table
    const invResult = await client.query(
      `SELECT reorder_level FROM inventory WHERE product_id = $1 LIMIT 1`,
      [item.product_id]
    );
    const reorderLevel = invResult.rows.length > 0
      ? invResult.rows[0].reorder_level
      : DEFAULT_REORDER_LEVEL;

    if (stockAfter <= reorderLevel) {
      alerts.push({
        product_id: item.product_id,
        product_name: product.name,
        sku: product.sku,
        stock_after: stockAfter,
        reorder_level: reorderLevel,
      });
    }
  }

  return alerts;
}

/**
 * Restore inventory when an order is cancelled.
 * Must be called within an active transaction (PoolClient).
 */
export async function restoreInventory(
  client: PoolClient,
  orderId: string,
  userId?: string
): Promise<void> {
  // Get order items
  const itemsResult = await client.query(
    `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
    [orderId]
  );

  for (const item of itemsResult.rows) {
    const productResult = await client.query(
      `SELECT stock_qty FROM products WHERE id = $1 FOR UPDATE`,
      [item.product_id]
    );

    if (productResult.rows.length === 0) continue;

    const stockBefore = productResult.rows[0].stock_qty || 0;
    const stockAfter = stockBefore + item.quantity;

    await client.query(
      `UPDATE products SET stock_qty = $1, updated_at = NOW() WHERE id = $2`,
      [stockAfter, item.product_id]
    );

    await client.query(
      `INSERT INTO inventory_transactions
         (product_id, transaction_type, quantity_change, quantity_before, quantity_after,
          reason, reference_type, reference_id, created_by)
       VALUES ($1, 'add', $2, $3, $4, $5, 'order', $6, $7)`,
      [
        item.product_id,
        item.quantity,
        stockBefore,
        stockAfter,
        `Order ${orderId} cancelled — stock restored`,
        orderId,
        userId || null,
      ]
    );
  }
}
