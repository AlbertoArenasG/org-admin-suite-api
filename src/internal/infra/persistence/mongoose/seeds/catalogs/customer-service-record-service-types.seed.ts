import { Model } from 'mongoose';

import { genId } from '@src/common/utils';
import {
  CustomerServiceRecordServiceTypeDocument,
  CustomerServiceRecordServiceTypeSchema,
} from '@infra/persistence/mongoose/schemas';
import {
  MongooseSeedContext,
  MongooseSeedDefinition,
  SeedReportItem,
} from '../shared/mongoose-seed.types';

const SERVICE_TYPES = [
  { code: 'AJUSTE', name: 'Ajuste' },
  { code: 'AJUSTE_Y_CALIBRACION', name: 'Ajuste y calibración' },
  { code: 'ANALISIS', name: 'Análisis' },
  { code: 'CALIBRACION', name: 'Calibración' },
  { code: 'CALIBRACION_EN_SITIO', name: 'Calibración en sitio' },
  { code: 'EQUIPO_AUXILIAR', name: 'Equipo auxiliar' },
  { code: 'FABRICACION', name: 'Fabricación' },
  { code: 'GARANTIA', name: 'Garantía' },
  { code: 'LOGISTICA', name: 'Logística' },
  { code: 'MANTENIMIENTO_CORRECTIVO', name: 'Mantenimiento correctivo' },
  {
    code: 'MANTENIMIENTO_CORRECTIVO_Y_CALIBRACION',
    name: 'Mantenimiento correctivo y calibración',
  },
  {
    code: 'MANTENIMIENTO_CORRECTIVO_AJUSTE_Y_CALIBRACION',
    name: 'Mantenimiento correctivo, ajuste y calibración',
  },
  { code: 'MANTENIMIENTO_PREVENTIVO', name: 'Mantenimiento preventivo' },
  {
    code: 'MANTENIMIENTO_PREVENTIVO_Y_CALIBRACION',
    name: 'Mantenimiento preventivo y calibración',
  },
  { code: 'RENTA_DE_EQUIPO', name: 'Renta de equipo' },
  { code: 'REUBICACION', name: 'Reubicación' },
  { code: 'REVISION', name: 'Revisión' },
  { code: 'SOPORTE_Y_CAPACITACION', name: 'Soporte y capacitación' },
  { code: 'VENTA', name: 'Venta' },
] as const;

function getModel(
  connection: MongooseSeedContext['connection'],
): Model<CustomerServiceRecordServiceTypeDocument> {
  return (
    connection.models[CustomerServiceRecordServiceTypeDocument.name] ??
    connection.model(
      CustomerServiceRecordServiceTypeDocument.name,
      CustomerServiceRecordServiceTypeSchema,
    )
  );
}

export const customerServiceRecordServiceTypesSeed: MongooseSeedDefinition = {
  name: 'customer-service-record-service-types',
  async run(context: MongooseSeedContext): Promise<SeedReportItem> {
    const model = getModel(context.connection);
    const report: SeedReportItem = {
      name: 'customer-service-record-service-types',
      created: 0,
      updated: 0,
      unchanged: 0,
    };

    for (const serviceType of SERVICE_TYPES) {
      const existing = await model.findOne({ code: serviceType.code }).exec();

      if (existing) {
        report.unchanged += 1;
        continue;
      }

      await model.create({
        customer_service_record_service_type_id: genId(),
        code: serviceType.code,
        name: serviceType.name,
        created_by: null,
        updated_by: null,
      });
      report.created += 1;
    }

    return report;
  },
};
