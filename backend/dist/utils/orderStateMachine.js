"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidStatus = isValidStatus;
exports.canTransition = canTransition;
exports.getNextStatuses = getNextStatuses;
exports.validateTransition = validateTransition;
const VALID_TRANSITIONS = {
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
const ALL_STATUSES = Object.keys(VALID_TRANSITIONS);
function isValidStatus(status) {
    return ALL_STATUSES.includes(status);
}
function canTransition(from, to) {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
function getNextStatuses(current) {
    return VALID_TRANSITIONS[current] || [];
}
function validateTransition(from, to) {
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
//# sourceMappingURL=orderStateMachine.js.map