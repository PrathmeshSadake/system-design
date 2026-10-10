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
import { topic as lldIntroduction } from "./topics/lld-introduction";
import { topic as lldOop } from "./topics/lld-oop";
import { topic as lldRelationships } from "./topics/lld-relationships";
import { topic as lldUml } from "./topics/lld-uml";
import { topic as lldSolid } from "./topics/lld-solid";
import { topic as lldInjection } from "./topics/lld-injection";
import { topic as lldCreational } from "./topics/lld-creational";
import { topic as lldStructural } from "./topics/lld-structural";
import { topic as lldBehavioral } from "./topics/lld-behavioral";
import { topic as lldBehavioralLinks } from "./topics/lld-behavioral-links";
import { topic as lldPrinciples } from "./topics/lld-principles";
import { topic as lldDomain } from "./topics/lld-domain";
import { topic as lldClarify } from "./topics/lld-clarify";
import { topic as lldCollections } from "./topics/lld-collections";
import { topic as lldCorrectness } from "./topics/lld-correctness";
import { topic as lldTheRound } from "./topics/lld-the-round";
import { topic as lldSplitwise } from "./topics/lld-splitwise";
import { topic as lldCache } from "./topics/lld-cache";
import { topic as lldMessaging } from "./topics/lld-messaging";
import { topic as lldRateLimiting } from "./topics/lld-rate-limiting";
import { topic as lldParkingElevator } from "./topics/lld-parking-elevator";
import { topic as lldBookings } from "./topics/lld-bookings";
import { topic as lldFoodAndCabs } from "./topics/lld-food-and-cabs";
import { topic as lldGames } from "./topics/lld-games";
import { topic as lldKiosks } from "./topics/lld-kiosks";
import { topic as lldCommerce } from "./topics/lld-commerce";
import { topic as lldMoney } from "./topics/lld-money";
import { topic as lldScores } from "./topics/lld-scores";
import { topic as lldOps } from "./topics/lld-ops";
import { topic as lldStorage } from "./topics/lld-storage";

/** Every topic, in reading order. Concepts, then case studies, then low level design. */
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
  lldIntroduction,
  lldOop,
  lldRelationships,
  lldUml,
  lldSolid,
  lldInjection,
  lldCreational,
  lldStructural,
  lldBehavioral,
  lldBehavioralLinks,
  lldPrinciples,
  lldDomain,
  lldClarify,
  lldCollections,
  lldCorrectness,
  lldTheRound,
  lldSplitwise,
  lldCache,
  lldMessaging,
  lldRateLimiting,
  lldParkingElevator,
  lldBookings,
  lldFoodAndCabs,
  lldGames,
  lldKiosks,
  lldCommerce,
  lldMoney,
  lldScores,
  lldOps,
  lldStorage,
];

export const concepts = topics.filter((t) => t.kind === "concept");
export const caseStudies = topics.filter((t) => t.kind === "case-study");
export const lldLessons = topics.filter((t) => t.kind === "lld");

export function getTopic(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}
