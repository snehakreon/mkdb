"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrementInventory = decrementInventory;
exports.restoreInventory = restoreInventory;
const BACK_ORDER_LEAD_DAYS = 18; // 15-20 day range, use 18 as default
/**
 * Decrement product stock_qty and log inventory transaction.
 * Never rejects an order — if stock is insufficient, the shortfall
 * is marked as back_order with a 15-20 day delivery timeline.
 * Must be called within an active transaction (PoolClient).
 */
async function decrementInventory(client, items, orderId, userId) {
    const alerts = [];
    const fulfillment = [];
    let latestDeliveryDate = new Date();
    for (const item of items) {
        // Lock the product row
        const productResult = await client.query(`SELECT id, name, sku, stock_qty, lead_time_days
       FROM products WHERE id = $1 FOR UPDATE`, [item.product_id]);
        if (productResult.rows.length === 0) {
            throw new Error(`Product ${item.product_id} not found`);
        }
        const product = productResult.rows[0];
        const stockBefore = product.stock_qty || 0;
        const quantityFromStock = Math.min(stockBefore, item.quantity);
        const quantityBackOrder = item.quantity - quantityFromStock;
        const stockAfter = stockBefore - quantityFromStock;
        // Calculate delivery estimate
        const inStock = quantityBackOrder === 0;
        const leadDays = inStock
            ? (product.lead_time_days || 3) // in-stock: use product lead time or 3 days
            : Math.max(product.lead_time_days || BACK_ORDER_LEAD_DAYS, BACK_ORDER_LEAD_DAYS); // back-order: 15-20 days
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + leadDays);
        if (deliveryDate > latestDeliveryDate) {
            latestDeliveryDate = deliveryDate;
        }
        fulfillment.push({
            product_id: item.product_id,
            product_name: product.name,
            sku: product.sku,
            quantity_requested: item.quantity,
            quantity_from_stock: quantityFromStock,
            quantity_back_order: quantityBackOrder,
            in_stock: inStock,
            estimated_delivery_days: leadDays,
            estimated_delivery_date: deliveryDate.toISOString().split("T")[0],
        });
        // Decrement available stock (only what we have)
        if (quantityFromStock > 0) {
            await client.query(`UPDATE products SET stock_qty = $1, updated_at = NOW() WHERE id = $2`, [stockAfter, item.product_id]);
            await client.query(`INSERT INTO inventory_transactions
           (product_id, transaction_type, quantity_change, quantity_before, quantity_after,
            reason, reference_type, reference_id, created_by)
         VALUES ($1, 'reduce', $2, $3, $4, $5, 'order', $6, $7)`, [
                item.product_id,
                -quantityFromStock,
                stockBefore,
                stockAfter,
                `Order ${orderId} — ${quantityFromStock} from stock`,
                orderId,
                userId || null,
            ]);
        }
        // Log back-order reservation if any
        if (quantityBackOrder > 0) {
            await client.query(`INSERT INTO inventory_transactions
           (product_id, transaction_type, quantity_change, quantity_before, quantity_after,
            reason, reference_type, reference_id, created_by)
         VALUES ($1, 'reserve', $2, $3, $4, $5, 'order', $6, $7)`, [
                item.product_id,
                -quantityBackOrder,
                stockAfter,
                stockAfter, // stock doesn't change further, it's a back-order
                `Order ${orderId} — ${quantityBackOrder} on back-order (est. ${leadDays} days)`,
                orderId,
                userId || null,
            ]);
            // Update order_items with back-order info
            await client.query(`UPDATE order_items
         SET fulfillment_status = 'back_order',
             quantity_back_order = $1
         WHERE order_id = $2 AND product_id = $3`, [quantityBackOrder, orderId, item.product_id]);
        }
        // Check for low stock
        const DEFAULT_REORDER_LEVEL = 10;
        const invResult = await client.query(`SELECT reorder_level FROM inventory WHERE product_id = $1 LIMIT 1`, [item.product_id]);
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
    const hasBackOrder = fulfillment.some((f) => f.quantity_back_order > 0);
    return {
        fulfillment,
        low_stock_alerts: alerts,
        has_back_order: hasBackOrder,
        expected_delivery_date: latestDeliveryDate.toISOString().split("T")[0],
    };
}
/**
 * Restore inventory when an order is cancelled.
 * Only restores the quantity_from_stock portion (not back-orders).
 * Must be called within an active transaction (PoolClient).
 */
async function restoreInventory(client, orderId, userId) {
    const itemsResult = await client.query(`SELECT product_id, quantity, COALESCE(quantity_back_order, 0) AS quantity_back_order
     FROM order_items WHERE order_id = $1`, [orderId]);
    for (const item of itemsResult.rows) {
        const restoreQty = item.quantity - (item.quantity_back_order || 0);
        if (restoreQty <= 0)
            continue;
        const productResult = await client.query(`SELECT stock_qty FROM products WHERE id = $1 FOR UPDATE`, [item.product_id]);
        if (productResult.rows.length === 0)
            continue;
        const stockBefore = productResult.rows[0].stock_qty || 0;
        const stockAfter = stockBefore + restoreQty;
        await client.query(`UPDATE products SET stock_qty = $1, updated_at = NOW() WHERE id = $2`, [stockAfter, item.product_id]);
        await client.query(`INSERT INTO inventory_transactions
         (product_id, transaction_type, quantity_change, quantity_before, quantity_after,
          reason, reference_type, reference_id, created_by)
       VALUES ($1, 'add', $2, $3, $4, $5, 'order', $6, $7)`, [
            item.product_id,
            restoreQty,
            stockBefore,
            stockAfter,
            `Order ${orderId} cancelled — stock restored`,
            orderId,
            userId || null,
        ]);
    }
}
//# sourceMappingURL=inventory.js.map