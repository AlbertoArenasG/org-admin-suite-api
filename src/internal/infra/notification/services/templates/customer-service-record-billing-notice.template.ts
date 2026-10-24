import { CustomerServiceRecordBillingNotice } from '@domain/ports/services';

export function customerServiceRecordBillingNoticeTemplate(
  notice: CustomerServiceRecordBillingNotice,
): { subject: string; text: string } {
  const lines = [
    `El registro de servicio ${notice.serviceNumberDisplay} fue enviado a facturación.`,
    `Cliente: ${notice.customerName}`,
    '',
    'Equipos:',
    ...notice.assets.flatMap((asset, index) => [
      `${index + 1}. ${asset.name}`,
      `   Identificador: ${asset.identifier}`,
      `   Marca: ${asset.brand}`,
      `   Modelo: ${asset.model}`,
      `   Número de serie: ${asset.serialNumber}`,
      ...(asset.observations
        ? [`   Observaciones: ${asset.observations}`]
        : []),
    ]),
  ];

  return {
    subject: `Registro ${notice.serviceNumberDisplay} enviado a facturación`,
    text: lines.join('\n'),
  };
}
