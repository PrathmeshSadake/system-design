import type { Topic } from "@/lib/types";
import { topic as capacityEstimation } from "./topics/capacity-estimation";
import { topic as apiDesignNetworking } from "./topics/api-design-networking";
import { topic as dataStorage } from "./topics/data-storage";
import { topic as cachingStrategies } from "./topics/caching-strategies";
import { topic as asynchronousCommunication } from "./topics/asynchronous-communication";
import { topic as distributedSystemsCore } from "./topics/distributed-systems-core";
import { topic as advancedDatabaseArchitectures } from "./topics/advanced-database-architectures";
import { topic as dataConsistencyTransactions } from "./topics/data-consistency-transactions";
import { topic as highThroughputStreaming } from "./topics/high-throughput-streaming";
import { topic as systemResiliency } from "./topics/system-resiliency";
import { topic as observabilityTelemetry } from "./topics/observability-telemetry";
import { topic as crossSystemArchitecture } from "./topics/cross-system-architecture";
import { topic as complexMigrations } from "./topics/complex-migrations";
import { topic as operationalScaleCost } from "./topics/operational-scale-cost";
import { topic as flashSaleInventory } from "./topics/flash-sale-inventory";
import { topic as distributedOrderFulfillment } from "./topics/distributed-order-fulfillment";
import { topic as liveLeaderboard } from "./topics/live-leaderboard";
import { topic as globalVideoDelivery } from "./topics/global-video-delivery";
import { topic as paymentProcessingEngine } from "./topics/payment-processing-engine";
import { topic as realTimeFraudDetection } from "./topics/real-time-fraud-detection";

/** Every topic, in reading order. Concepts first, then case studies. */
export const topics: Topic[] = [
  capacityEstimation,
  apiDesignNetworking,
  dataStorage,
  cachingStrategies,
  asynchronousCommunication,
  distributedSystemsCore,
  advancedDatabaseArchitectures,
  dataConsistencyTransactions,
  highThroughputStreaming,
  systemResiliency,
  observabilityTelemetry,
  crossSystemArchitecture,
  complexMigrations,
  operationalScaleCost,
  flashSaleInventory,
  distributedOrderFulfillment,
  liveLeaderboard,
  globalVideoDelivery,
  paymentProcessingEngine,
  realTimeFraudDetection,
];

export const concepts = topics.filter((t) => t.kind === "concept");
export const caseStudies = topics.filter((t) => t.kind === "case-study");

export function getTopic(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}
