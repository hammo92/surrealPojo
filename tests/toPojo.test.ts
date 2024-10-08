import { RecordId, Uuid, Duration, Decimal, Table, GeometryPoint, GeometryLine, GeometryPolygon, GeometryMultiPoint, GeometryMultiLine, GeometryMultiPolygon, GeometryCollection } from 'surrealdb';
import { convertToPojo } from '../src';

describe('SurrealDB to POJO Conversion', () => {
    test('Convert SurrealDB types to POJO', () => {
        const surrealObject = {
            id: new RecordId('thing', '1'),
            name: 'Test',
            uuid: new Uuid('123e4567-e89b-12d3-a456-426614174000'),
            duration: new Duration('1h30m'),
            location: new GeometryPoint([2.0, 1.0]),
            balance: new Decimal('100.50'),
            table: new Table('math')
        };

        const item = convertToPojo(surrealObject);

        expect(item).toEqual({
            id: {
                tb: 'thing',
                id: '1'
            },
            name: 'Test',
            uuid: {
                type: "uuid",
                value: '123e4567-e89b-12d3-a456-426614174000'
            },
            duration: {
                type: "duration",
                value: '1h30m'
            },
            location: {
                type: 'Point',
                coordinates: [2, 1]
            },
            balance: {
                type: "decimal",
                value: '100.50'
            },
            table: {
                type: "table",
                name: 'math'
            }
        });
    });

    test('Convert nested SurrealDB types to POJO', () => {
        const surrealObject = {
            user: {
                id: new RecordId('user', '123'),
                details: {
                    uuid: new Uuid('11111111-1111-1111-1111-111111111111'),
                    lastLogin: new Duration('3d12h')
                }
            },
            locations: [
                new GeometryPoint([1.0, 2.0]),
                new GeometryPoint([3.0, 4.0])
            ]
        };

        const item = convertToPojo(surrealObject);

        expect(item).toEqual({
            user: {
                id: {
                    tb: 'user',
                    id: '123'
                },
                details: {
                    uuid: {
                        type: "uuid",
                        value: '11111111-1111-1111-1111-111111111111'
                    },
                    lastLogin: {
                        type: "duration",
                        value: '3d12h'
                    }
                }
            },
            locations: [
                {
                    type: 'Point',
                    coordinates: [1, 2]
                },
                {
                    type: 'Point',
                    coordinates: [3, 4]
                }
            ]
        });
    });
});