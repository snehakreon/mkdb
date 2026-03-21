/**
 * Order Workflow State Machine
 *
 * Valid transitions:
 *   pending → confirmed | pending_dealer_approval | cancelled
 *   pending_dealer_approval → confirmed | cancelled
 *   confirmed → dispatched | cancelled
 *   dispatched → in_transit
 *   in_transit → delivered | partially_delivered
 *   partially_delivered → delivered | disputed
 *   delivered → disputed
 *   disputed → (terminal — resolved manually)
 *   cancelled → (terminal)
 */

export type OrderStatus =
  | "pending"
  | "pending_dealer_approval"
  | "confirmed"
  | "dispatched"
  | "in_transit"
  | "delivered"
  | "partially_delivered"
  | "cancelled"
  | "disputed";

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "pending_dealer_approval", "cancelled"],
  pending_dealer_approval: ["confirmed", "cancelled"],
  confirmed: ["dispatched", "cancelled"],
  dispatched: ["in_transit"],
  in_transit: ["delivered", "partially_delivered"],
  partially_delivered: ["delivered", "disputed"],
  delivered: ["disputed"],
  disputed: [],
  cancelled: [],
};

const ALL_STATUSES = Object.keys(VALID_TRANSITIONS) as OrderStatus[];

export function isValidStatus(status: string): status is OrderStatus {
  return ALL_STATUSES.includes(status as OrderStatus);
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getNextStatuses(current: OrderStatus): OrderStatus[] {
  return VALID_TRANSITIONS[current] || [];
}

export function validateTransition(
  from: string,
  to: string
): { valid: boolean; message?: string } {
  if (!isValidStatus(from)) {
    return { valid: false, message: `Invalid current status: '${from}'` };
  }
  if (!isValidStatus(to)) {
    return { valid: false, message: `Invalid target status: '${to}'. Valid statuses: ${ALL_STATUSES.join(", ")}` };
  }
  if (!canTransition(from, to)) {
    const allowed = getNextStatuses(from);
    if (allowed.length === 0) {
      return { valid: false, message: `Order in '${from}' status is terminal and cannot be changed` };
    }
    return {
      valid: false,
      message: `Cannot transition from '${from}' to '${to}'. Allowed transitions: ${allowed.join(", ")}`,
    };
  }
  return { valid: true };
}
