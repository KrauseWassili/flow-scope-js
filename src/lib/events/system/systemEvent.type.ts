
import { EventType } from "../sсhemas";
import { EventStage } from "../stages/eventStages";

export type EventSource =
  | "client"
  | "api"
  | "redis"
  | "db"
  | "ws"
  | "infra";

export type SystemEvent = {
  id: string;
  traceId: string;
  type: EventType;     
  stage: EventStage;
  source: EventSource;
  timestamp: number;
  payload?: Record<string, any>;
};

export type SystemEventInput = {
  traceId: string;
  type: EventType;
  stage: EventStage;
  payload?: Record<string, any>;
};
