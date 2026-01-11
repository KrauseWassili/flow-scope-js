import { z } from "zod";

export const baseEventSchema = z.object({
  traceId: z.string().uuid(),
});