import { z } from "zod";
import { baseEventSchema } from "./baseEventSchema";

export const messageExchangeSchema = baseEventSchema.extend({
  type: z.literal("MESSAGE_EXCHANGE"),
  from: z.string(),
  to: z.string(),
  payload: z.object({
    text: z.string(),
  }),
});

export const userLoginSchema = baseEventSchema.extend({
  type: z.literal("USER_LOGIN"),
  userId: z.string(),
  method: z.enum(["password", "oauth"]),
});

export const userRegisterSchema = baseEventSchema.extend({
  type: z.literal("USER_REGISTER"),
  userId: z.string(),
  email: z.string().email(),
});

export const userLogoutSchema = baseEventSchema.extend({
  type: z.literal("USER_LOGOUT"),
  userId: z.string(),
});

export const eventSchemas = {
  MESSAGE_EXCHANGE: messageExchangeSchema,
  USER_LOGIN: userLoginSchema,
  USER_REGISTER: userRegisterSchema,
  USER_LOGOUT: userLogoutSchema,
} as const;

export type EventType = keyof typeof eventSchemas;
