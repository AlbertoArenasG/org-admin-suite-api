import { CustomerServiceRecordBillingNotice } from '@domain/ports/services';

function formatDate(value: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'long',
    timeZone,
  }).format(value);
}

export function customerServiceRecordBillingNoticeTemplate(
  notice: CustomerServiceRecordBillingNotice,
): { subject: string; text: string } {
  const requestedAt = formatDate(
    new Date(`${notice.requestedAt}T00:00:00Z`),
    'UTC',
  );
  const createdAt = notice.createdAt
    ? formatDate(notice.createdAt, 'America/Mexico_City')
    : 'No disponible';
  const lines = [
    `El registro de servicio ${notice.serviceNumberDisplay} fue enviado a facturación.`,
    `Cliente: ${notice.customerName}`,
    `Fecha de solicitud: ${requestedAt}`,
    `Fecha de creación: ${createdAt}`,
    '',
    'Equipos:',
    ...notice.assets.flatMap((asset, index) => [
      `${index + 1}. ${asset.name}`,
      `   Identificador: ${asset.identifier}`,
      `   Marca: ${asset.brand}`,
      `   Modelo: ${asset.model}`,
      `   Número de serie: ${asset.serialNumber}`,
    ]),
  ];

  return {
    subject: `Registro ${notice.serviceNumberDisplay} enviado a facturación`,
    text: lines.join('\n'),
  };
}
