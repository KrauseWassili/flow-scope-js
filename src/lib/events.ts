export type EventType = "MESSAGE_SENT";

export type SystemEvent = {
    id: string;
    type: EventType;
    from: string;
    to: string;
    payload: {
        text: string;
    };
    timestamp: Date;
}