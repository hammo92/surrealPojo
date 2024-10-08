import {
    RecordId as BaseRecordId,
    Uuid as BaseUuid,
    Duration as BaseDuration,
    Geometry as BaseGeometry,
    Decimal as BaseDecimal,
    Table as BaseTable,
    type RecordIdValue,
    GeometryPoint,
    GeometryLine,
    GeometryPolygon,
    GeometryMultiPoint,
    GeometryMultiLine,
    GeometryMultiPolygon, GeometryCollection
} from "surrealdb";

import { newRecordId, newUuid, newDuration, newGeometry, newDecimal, newTable } from './factories';
import {
    isRecordId,
    isUuid,
    isDuration,
    isGeometry,
    isDecimal,
    isTable,
} from './typeGuards';
import {Geometry} from "./types.ts";

type ConvertToPojo<T> =
    T extends BaseRecordId ? ReturnType<typeof newRecordId> :
        T extends BaseUuid ? ReturnType<typeof newUuid> :
            T extends BaseDuration ? ReturnType<typeof newDuration> :
                T extends BaseGeometry ? ReturnType<typeof newGeometry> :
                    T extends BaseDecimal ? ReturnType<typeof newDecimal> :
                        T extends BaseTable ? ReturnType<typeof newTable> :
                            T extends Array<infer U> ? Array<ConvertToPojo<U>> :
                                T extends Date ? Date :
                                    T extends object ? { [K in keyof T]: ConvertToPojo<T[K]> } :
                                        T;

type ConvertToSurrealClass<T> =
    T extends ReturnType<typeof newRecordId> ? BaseRecordId :
        T extends ReturnType<typeof newUuid> ? BaseUuid :
            T extends ReturnType<typeof newDuration> ? BaseDuration :
                T extends ReturnType<typeof newGeometry> ? BaseGeometry :
                    T extends ReturnType<typeof newDecimal> ? BaseDecimal :
                        T extends ReturnType<typeof newTable> ? BaseTable :
                            T extends Array<infer U> ? Array<ConvertToSurrealClass<U>> :
                                T extends Date ? Date :
                                    T extends object ? { [K in keyof T]: ConvertToSurrealClass<T[K]> } :
                                        T;

export function convertToPojo<T>(value: T): ConvertToPojo<T> {
    if (value instanceof BaseRecordId) {
        return newRecordId(value.tb, convertToPojo(value.id) as RecordIdValue) as ConvertToPojo<T>;
    }
    if (value instanceof BaseUuid) {
        return newUuid(value.toString()) as ConvertToPojo<T>;
    }
    if (value instanceof BaseDuration) {
        return newDuration(value.toString()) as ConvertToPojo<T>;
    }
    if (value instanceof BaseGeometry) {
        const json = value.toJSON() as Geometry;
        switch (json.type) {
            case "Point":
            case "LineString":
            case "Polygon":
            case "MultiPoint":
            case "MultiLineString":
            case "MultiPolygon":
                return newGeometry(json) as ConvertToPojo<T>;
            default:
                throw new Error(`Unsupported geometry type: ${json.type}`);
        }
    }
    if (value instanceof BaseDecimal) {
        return newDecimal(value.toString()) as ConvertToPojo<T>;
    }
    if (value instanceof BaseTable) {
        return newTable(value.toString()) as ConvertToPojo<T>;
    }
    if (Array.isArray(value)) return value.map(convertToPojo) as ConvertToPojo<T>;
    if (value instanceof Date) return value as ConvertToPojo<T>;
    if (typeof value === "object" && value !== null) {
        const obj: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value)) {
            obj[key] = convertToPojo(val);
        }
        return obj as ConvertToPojo<T>;
    }
    return value as ConvertToPojo<T>;
}

function convertGeometryPoint(coordinates: [number, number]): GeometryPoint {
    return new GeometryPoint(coordinates);
}

function convertGeometryLine(coordinates: [number, number][]): GeometryLine {
    if (coordinates.length < 2) {
        throw new Error("A line must have at least two points");
    }
    const points = coordinates.map(coord => new GeometryPoint(coord));
    return new GeometryLine(points as [GeometryPoint, GeometryPoint, ...GeometryPoint[]]);
}

function convertGeometryPolygon(coordinates: [number, number][][]): GeometryPolygon {
    if (coordinates.length < 1) {
        throw new Error("A polygon must have at least one line");
    }
    const lines = coordinates.map(convertGeometryLine);
    return new GeometryPolygon(lines as [GeometryLine, ...GeometryLine[]]);
}

function convertGeometryMultiPoint(coordinates: [number, number][]): GeometryMultiPoint {
    if (coordinates.length === 0) {
        throw new Error("A MultiPoint must have at least one point");
    }
    const points = coordinates.map(coord => new GeometryPoint(coord));
    return new GeometryMultiPoint(points as [GeometryPoint, ...GeometryPoint[]]);
}

function convertGeometryMultiLine(coordinates: [number, number][][]): GeometryMultiLine {
    if (coordinates.length === 0) {
        throw new Error("A MultiLine must have at least one line");
    }
    const lines = coordinates.map(convertGeometryLine);
    return new GeometryMultiLine(lines as [GeometryLine, ...GeometryLine[]]);
}

function convertGeometryMultiPolygon(coordinates: [number, number][][][]): GeometryMultiPolygon {
    if (coordinates.length === 0) {
        throw new Error("A MultiPolygon must have at least one polygon");
    }
    const polygons = coordinates.map(convertGeometryPolygon);
    return new GeometryMultiPolygon(polygons as [GeometryPolygon, ...GeometryPolygon[]]);
}

export function convertToSurrealClass<T>(value: T): ConvertToSurrealClass<T> {
    if (typeof value === "object" && value !== null) {
        if (isRecordId(value)) {
            return new BaseRecordId(value.tb, convertToSurrealClass(value.id) as RecordIdValue) as ConvertToSurrealClass<T>;
        }
        if (isUuid(value)) {
            return new BaseUuid(value.value) as ConvertToSurrealClass<T>;
        }
        if (isDuration(value)) {
            return new BaseDuration(value.value) as ConvertToSurrealClass<T>;
        }
        if (isDecimal(value)) {
            return new BaseDecimal(value.value) as ConvertToSurrealClass<T>;
        }
        if (isTable(value)) {
            return new BaseTable(value.name) as ConvertToSurrealClass<T>;
        }
        if (isGeometry(value)) {
            switch (value.type) {
                case "Point":
                    return convertGeometryPoint(value.coordinates) as ConvertToSurrealClass<T>;
                case "LineString":
                    return convertGeometryLine(value.coordinates) as ConvertToSurrealClass<T>;
                case "Polygon":
                    return convertGeometryPolygon(value.coordinates) as ConvertToSurrealClass<T>;
                case "MultiPoint":
                    return convertGeometryMultiPoint(value.coordinates) as ConvertToSurrealClass<T>;
                case "MultiLineString":
                    return convertGeometryMultiLine(value.coordinates) as ConvertToSurrealClass<T>;
                case "MultiPolygon":
                    return convertGeometryMultiPolygon(value.coordinates) as ConvertToSurrealClass<T>;
            }
        }
        if (Array.isArray(value)) {
            return value.map(convertToSurrealClass) as ConvertToSurrealClass<T>;
        }
        const obj: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value)) {
            obj[key] = convertToSurrealClass(val);
        }
        return obj as ConvertToSurrealClass<T>;
    }
    if (value instanceof Date) return value as ConvertToSurrealClass<T>;
    return value as ConvertToSurrealClass<T>;
}
