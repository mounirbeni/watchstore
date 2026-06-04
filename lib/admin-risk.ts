import { OrderStatus, PaymentStatus } from "@prisma/client";

type RiskOrder = {
  status: OrderStatus;
  flagged: boolean;
  cancellationReason: string | null;
  createdAt: Date;
  payment: { status: PaymentStatus } | null;
};

export type CustomerRiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface CustomerRiskSummary {
  level: CustomerRiskLevel;
  score: number;
  cancellations: number;
  deliveryRefusals: number;
  failedPayments: number;
  flaggedOrders: number;
  ordersLast24h: number;
  reasons: string[];
}

export function calculateCustomerRisk(orders: RiskOrder[]): CustomerRiskSummary {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const cancellations = orders.filter((order) => order.status === OrderStatus.CANCELLED).length;
  const deliveryRefusals = orders.filter((order) =>
    (order.cancellationReason ?? "").toLowerCase().includes("refus"),
  ).length;
  const failedPayments = orders.filter((order) =>
    order.payment?.status === PaymentStatus.FAILED || order.payment?.status === PaymentStatus.DEPOSIT_FAILED,
  ).length;
  const flaggedOrders = orders.filter((order) => order.flagged).length;
  const ordersLast24h = orders.filter((order) => order.createdAt >= since24h).length;

  let score = 0;
  const reasons: string[] = [];

  if (cancellations >= 3) {
    score += 30;
    reasons.push(`${cancellations} cancellations`);
  } else if (cancellations >= 1) {
    score += 10;
  }

  if (deliveryRefusals >= 2) {
    score += 35;
    reasons.push(`${deliveryRefusals} delivery refusals`);
  } else if (deliveryRefusals >= 1) {
    score += 20;
    reasons.push("delivery refusal");
  }

  if (failedPayments >= 3) {
    score += 25;
    reasons.push(`${failedPayments} failed payments`);
  } else if (failedPayments >= 1) {
    score += 10;
  }

  if (flaggedOrders > 0) {
    score += flaggedOrders * 20;
    reasons.push(`${flaggedOrders} flagged orders`);
  }

  if (ordersLast24h >= 5) {
    score += 25;
    reasons.push(`${ordersLast24h} orders in 24h`);
  }

  const cappedScore = Math.min(score, 100);
  const level: CustomerRiskLevel = cappedScore >= 70 ? "HIGH" : cappedScore >= 35 ? "MEDIUM" : "LOW";

  return {
    level,
    score: cappedScore,
    cancellations,
    deliveryRefusals,
    failedPayments,
    flaggedOrders,
    ordersLast24h,
    reasons,
  };
}

export function riskBadgeClass(level: CustomerRiskLevel) {
  if (level === "HIGH") return "border-red-500/40 bg-red-500/10 text-red-300";
  if (level === "MEDIUM") return "border-gold-500/40 bg-gold-500/10 text-gold-300";
  return "border-luxury-border bg-luxury-dark text-luxury-muted";
}
