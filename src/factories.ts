import type { RecordId, Uuid, Duration, Geometry, Decimal, Table } from './types';
import type { RecordIdValue } from "surrealdb";

export function newRecordId<Tb extends string>(tb: Tb, id: RecordIdValue): RecordId<Tb> {
    return { tb, id };
}

export function newUuid(value: string): Uuid {
    return { type: "uuid", value };
}

export function newDuration(value: string): Duration {
    return { type:"duration", value };
}

export function newDecimal(value: string): Decimal {
    return { type:"decimal", value };
}

export function newTable(name: string): Table {
    return { type:"table", name };
}

export function newGeometry(geometry: Geometry): Geometry {
    return geometry;
}
