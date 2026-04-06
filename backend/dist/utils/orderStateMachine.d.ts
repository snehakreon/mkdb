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
export type OrderStatus = "pending" | "pending_dealer_approval" | "confirmed" | "dispatched" | "in_transit" | "delivered" | "partially_delivered" | "cancelled" | "disputed";
export declare function isValidStatus(status: string): status is OrderStatus;
export declare function canTransition(from: OrderStatus, to: OrderStatus): boolean;
export declare function getNextStatuses(current: OrderStatus): OrderStatus[];
export declare function validateTransition(from: string, to: string): {
    valid: boolean;
    message?: string;
};
//# sourceMappingURL=orderStateMachine.d.ts.map