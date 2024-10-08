import {
    newRecordId,
    newUuid,
    newDuration,
    newGeometry,
    newDecimal,
    newTable,
    convertToSurrealClass
} from '../src';
import { RecordId, Uuid, Duration, Decimal, Table, GeometryPoint, GeometryLine, GeometryPolygon, GeometryMultiPoint, GeometryMultiLine, GeometryMultiPolygon, GeometryCollection } from 'surrealdb';

describe('POJO to SurrealDB Conversion', () => {
    test('Convert POJO input to SurrealDB types', () => {
        const input = {
            name: 'Test Input',
            uuid: newUuid('00000000-0000-0000-0000-000000000000'),
            duration: newDuration('2h45m'),
            location: newGeometry({type: 'Point', coordinates: [3.0, 4.0]}),
            balance: newDecimal('200.75'),
            table: newTable('science')
        };

        const result = convertToSurrealClass(input);

        expect(result).toEqual({
            name: 'Test Input',
            uuid: expect.any(Uuid),
            duration: expect.any(Duration),
            location: expect.any(GeometryPoint),
            balance: expect.any(Decimal),
            table: expect.any(Table)
        });

        expect(result.uuid.toString()).toBe('00000000-0000-0000-0000-000000000000');
        expect(result.duration.toString()).toBe('2h45m');
        expect((result.location as GeometryPoint).coordinates).toEqual([3.0, 4.0]);
        expect(result.balance.toString()).toBe('200.75');
        expect(result.table.toString()).toBe('science');
    });

    test('Convert nested POJO input to SurrealDB types', () => {
        const input = {
            user: {
                id: newRecordId('user', '123'),
                details: {
                    uuid: newUuid('11111111-1111-1111-1111-111111111111'),
                    lastLogin: newDuration('3d12h')
                }
            },
            locations: [
                newGeometry({type: 'Point', coordinates: [1.0, 2.0]}),
                newGeometry({type: 'Point', coordinates: [3.0, 4.0]})
            ]
        };

        const result = convertToSurrealClass(input);

        expect(result).toEqual({
            user: {
                id: expect.any(RecordId),
                details: {
                    uuid: expect.any(Uuid),
                    lastLogin: expect.any(Duration)
                }
            },
            locations: [
                expect.any(GeometryPoint),
                expect.any(GeometryPoint)
            ]
        });

        expect(result.user.id.tb).toBe('user');
        expect(result.user.id.id).toBe('123');
        expect(result.user.details.uuid.toString()).toBe('11111111-1111-1111-1111-111111111111');
        expect(result.user.details.lastLogin.toString()).toBe('3d12h');
        expect((result.locations[0] as GeometryPoint).coordinates).toEqual([1.0, 2.0]);
        expect((result.locations[1] as GeometryPoint).coordinates).toEqual([3.0, 4.0]);
    });

    test('Convert all geometry types to SurrealDB types', () => {
        const input = {
            point: newGeometry({ type: 'Point', coordinates: [1.0, 2.0] }),
            lineString: newGeometry({ type: 'LineString', coordinates: [[1.0, 2.0], [3.0, 4.0]] }),
            polygon: newGeometry({ type: 'Polygon', coordinates: [[[1.0, 2.0], [3.0, 4.0], [5.0, 6.0], [1.0, 2.0]]] }),
            multiPoint: newGeometry({ type: 'MultiPoint', coordinates: [[1.0, 2.0], [3.0, 4.0]] }),
            multiLineString: newGeometry({ type: 'MultiLineString', coordinates: [[[1.0, 2.0], [3.0, 4.0]], [[5.0, 6.0], [7.0, 8.0]]] }),
            multiPolygon: newGeometry({ type: 'MultiPolygon', coordinates: [[[[1.0, 2.0], [3.0, 4.0], [5.0, 6.0], [1.0, 2.0]]], [[[7.0, 8.0], [9.0, 10.0], [11.0, 12.0], [7.0, 8.0]]]] }),
        };

        const result = convertToSurrealClass(input);

        expect(result.point).toBeInstanceOf(GeometryPoint);
        expect(result.lineString).toBeInstanceOf(GeometryLine);
        expect(result.polygon).toBeInstanceOf(GeometryPolygon);
        expect(result.multiPoint).toBeInstanceOf(GeometryMultiPoint);
        expect(result.multiLineString).toBeInstanceOf(GeometryMultiLine);
        expect(result.multiPolygon).toBeInstanceOf(GeometryMultiPolygon);

        expect((result.point as GeometryPoint).coordinates).toEqual([1.0, 2.0]);
        expect((result.lineString as GeometryLine).coordinates).toEqual([[1.0, 2.0], [3.0, 4.0]]);
        expect((result.polygon as GeometryPolygon).coordinates).toEqual([[[1.0, 2.0], [3.0, 4.0], [5.0, 6.0], [1.0, 2.0]]]);
        expect((result.multiPoint as GeometryMultiPoint).coordinates).toEqual([[1.0, 2.0], [3.0, 4.0]]);
        expect((result.multiLineString as GeometryMultiLine).coordinates).toEqual([[[1.0, 2.0], [3.0, 4.0]], [[5.0, 6.0], [7.0, 8.0]]]);
        expect((result.multiPolygon as GeometryMultiPolygon).coordinates).toEqual([[[[1.0, 2.0], [3.0, 4.0], [5.0, 6.0], [1.0, 2.0]]], [[[7.0, 8.0], [9.0, 10.0], [11.0, 12.0], [7.0, 8.0]]]]);

    });
});