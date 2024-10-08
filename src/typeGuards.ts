import type { RecordId, Uuid, Duration, Geometry, Decimal, Table } from './types';

export function isRecordId(value: any): value is RecordId {
    return typeof value === "object" && value !== null && "tb" in value && "id" in value;
}

export function isUuid(value: any): value is Uuid {
    return typeof value === "object" && value !== null && value.type === "uuid" && typeof value.value === "string";
}

export function isDuration(value: any): value is Duration {
    return typeof value === "object" && value !== null && value.type === "duration" && typeof value.value === "string";
}

export function isDecimal(value: any): value is Decimal {
    return typeof value === "object" && value !== null && value.type === "decimal" && typeof value.value === "string";
}

export function isTable(value: any): value is Table {
    return typeof value === "object" && value !== null && value.type === "table" && typeof value.name === "string";
}

const geometryTypes = new Set(["Point", "LineString", "Polygon", "MultiPoint", "MultiLineString", "MultiPolygon", "Collection"]);

export function isGeometry(value: any): value is Geometry {
    return typeof value === "object" && value !== null && "type" in value &&
        typeof value.type === "string" && geometryTypes.has(value.type);
}
