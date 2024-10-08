import type { RecordIdValue } from "surrealdb";

export interface RecordId<Tb extends string = string> {
    tb: Tb;
    id: RecordIdValue;
}

export interface Uuid {
    type: "uuid";
    value: string;
}

export interface Duration {
    type: "duration";
    value: string;
}

export interface Decimal {
    type: "decimal";
    value: string;
}

export interface Table {
    type: "table";
    name: string;
}

export type Geometry =
    | { type: "Point", coordinates: [number, number] }
    | { type: "LineString", coordinates: [number, number][] }
    | { type: "Polygon", coordinates: [number, number][][] }
    | { type: "MultiPoint", coordinates: [number, number][] }
    | { type: "MultiLineString", coordinates: [number, number][][] }
    | { type: "MultiPolygon", coordinates: [number, number][][][] }
    | { type: "Collection", geometries: Geometry[] };

