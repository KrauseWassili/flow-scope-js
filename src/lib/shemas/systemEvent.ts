import z from "zod";

export const systemEventSchema = z.object({
    type: z.literal("MESSAGE_SENT"),
    from: z.string(),
    to: z.string(),
    payload: z.object({
        text: z.string(),
    }),
})

export type SystemEventInput = z.infer<typeof systemEventSchema>;