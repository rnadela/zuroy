import { Prisma } from '@zuroy/database';
import { ClsService } from 'nestjs-cls';
import { TENANT_SCOPED_MODELS } from './tenant-models';

const READ_OPS = new Set([
  'findMany',
  'findFirst',
  'findUnique',
  'count',
  'aggregate',
  'groupBy',
  'findFirstOrThrow',
  'findUniqueOrThrow',
]);

const CREATE_OPS = new Set(['create', 'createMany']);
const MUTATE_OPS = new Set(['update', 'updateMany', 'delete', 'deleteMany']);

export function tenantExtension(cls: ClsService) {
  return Prisma.defineExtension((client) =>
    client.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const hotelId = cls.get('hotelId');

            if (!hotelId || !TENANT_SCOPED_MODELS.includes(model as any)) {
              return query(args);
            }

            const a = args as any;

            if (READ_OPS.has(operation)) {
              a.where = { ...a.where, hotelId };
            } else if (CREATE_OPS.has(operation)) {
              if (Array.isArray(a.data)) {
                a.data = a.data.map((d: any) => ({ ...d, hotelId }));
              } else {
                a.data = { ...a.data, hotelId };
              }
            } else if (MUTATE_OPS.has(operation)) {
              a.where = { ...a.where, hotelId };
            }

            return query(a);
          },
        },
      },
    }),
  );
}
