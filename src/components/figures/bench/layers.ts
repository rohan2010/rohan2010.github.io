import type * as React from "react";

// The bench's parts in painter's order are listed in art.tsx (`LAYERS`). This
// module holds only their names, so the client figure can import them.

export type PartId =
  | "base"
  | "retryPath"
  | "baseTop"
  | "cabinet"
  | "drawer"
  | "vectorFront"
  | "gantry"
  | "rackBack"
  | "rackCarts"
  | "rackFront"
  | "socketBack"
  | "coilBack"
  | "pin"
  | "coilFront"
  | "seatPlate"
  | "jawBack"
  | "socketCarts"
  | "socketFront"
  | "windowDots"
  | "latch"
  | "latchPin"
  | "ribbon"
  | "carriage"
  | "plunger"
  | "jawFront"
  | "housing"
  | "evalSet"
  | "trackBed"
  | "chuteBack"
  | "trayBack"
  | "gaugeBack"
  | "flap"
  | "stack"
  | "ghost"
  | "card"
  | "railsFront"
  | "gaugeFront"
  | "chuteFront"
  | "trayFront"
  | "dial"
  | "needle"
  | "dialHub";

export type Group = "base" | "rack" | "socket" | "cabinet" | "gantry" | "picker" | "line" | "gauge" | "evalset" | "chute" | "tray" | "dial";

export interface Layer {
  id: PartId;
  group: Group;
  /** static art, or the static art a live part moves; null for parts built per frame */
  art: React.ReactNode | React.ReactNode[] | null;
}

/** What the client figure receives: the art in order, without the server-only grouping. */
export type LiveLayer = Pick<Layer, "id" | "art">;
