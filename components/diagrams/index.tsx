import type { JSX } from "react";
import { capacityDiagrams } from "./capacity";
import { apiDiagrams } from "./api";
import { storageDiagrams } from "./storage";
import { cachingDiagrams } from "./caching";
import { asyncDiagrams } from "./async";
import { distributedDiagrams } from "./distributed";
import { databasesDiagrams } from "./databases";
import { transactionsDiagrams } from "./transactions";
import { streamingDiagrams } from "./streaming";
import { resiliencyDiagrams } from "./resiliency";
import { observabilityDiagrams } from "./observability";
import { dddDiagrams } from "./ddd";
import { migrationsDiagrams } from "./migrations";
import { costDiagrams } from "./cost";
import { flashSaleDiagrams } from "./flash-sale";
import { fulfillmentDiagrams } from "./fulfillment";
import { leaderboardDiagrams } from "./leaderboard";
import { videoDiagrams } from "./video";
import { paymentsDiagrams } from "./payments";
import { fraudDiagrams } from "./fraud";

export const diagramRegistry = {
  ...capacityDiagrams,
  ...apiDiagrams,
  ...storageDiagrams,
  ...cachingDiagrams,
  ...asyncDiagrams,
  ...distributedDiagrams,
  ...databasesDiagrams,
  ...transactionsDiagrams,
  ...streamingDiagrams,
  ...resiliencyDiagrams,
  ...observabilityDiagrams,
  ...dddDiagrams,
  ...migrationsDiagrams,
  ...costDiagrams,
  ...flashSaleDiagrams,
  ...fulfillmentDiagrams,
  ...leaderboardDiagrams,
  ...videoDiagrams,
  ...paymentsDiagrams,
  ...fraudDiagrams,
} satisfies Record<string, () => JSX.Element>;

export type DiagramKey = keyof typeof diagramRegistry;

export function DiagramView({ name }: { name: DiagramKey }) {
  const Component = diagramRegistry[name];
  return <Component />;
}
