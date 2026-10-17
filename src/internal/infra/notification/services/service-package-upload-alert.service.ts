import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as AdmZipModule from 'adm-zip';
import type { IZipEntry } from 'adm-zip';
import { Multer } from 'multer';

const ALERT_RECIPIENTS = ['albarenasg@gmail.com', 'cesar.yepez@icsacv.com.mx'];

interface UploadAlert {
  attemptId: string;
  attemptedAt: Date;
  origin: string;
  file?: Multer.File;
  outcome: 'success' | 'failure';
  response?: unknown;
  error?: unknown;
}

interface ServiceSummary {
  serviceNumber: string;
  collectorName: string;
  visitDate: string;
  serviceTime: string;
}

interface UploadResult {
  packageId?: string;
  records: number;
}

@Injectable()
export class ServicePackageUploadAlertService {
  private readonly logger = new Logger(ServicePackageUploadAlertService.name);

  constructor(private readonly mailerService: MailerService) {}

  async notify(alert: UploadAlert): Promise<void> {
    const services = this.readServiceSummaries(alert.file?.buffer);
    const result = this.readUploadResult(alert.response);
    const status = alert.outcome === 'success' ? 'EXITOSO' : 'FALLIDO';
    const attemptedAt = new Intl.DateTimeFormat('es-MX', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(alert.attemptedAt);

    const serviceLines = services.length
      ? services.map(
          (service, index) =>
            `${index + 1}. Folio: ${service.serviceNumber}; recolector: ${service.collectorName}; visita: ${service.visitDate} ${service.serviceTime}`,
        )
      : ['No se pudieron recuperar folios ni recolectores del ZIP.'];

    const text = [
      `Resultado del procesamiento: ${status}`,
      `ID de intento: ${alert.attemptId}`,
      `Fecha y hora del intento: ${attemptedAt} (Ciudad de México)`,
      `Origen declarado: ${alert.origin}`,
      `Archivo: ${alert.file?.originalname ?? 'No recibido'}`,
      `Tamaño: ${alert.file?.size ?? 'No disponible'} bytes`,
      `ID de paquete: ${result.packageId ?? 'No disponible'}`,
      `Registros confirmados en respuesta: ${alert.outcome === 'success' ? result.records : 'No determinado'}`,
      ...(alert.outcome === 'failure'
        ? [
            `Causa: ${this.describeError(alert.error)}`,
            'El resultado parcial no se puede determinar con esta respuesta; pueden existir registros guardados antes del error.',
          ]
        : []),
      '',
      'Servicios identificados en el archivo (no necesariamente guardados):',
      ...serviceLines,
    ].join('\n');

    await this.mailerService.sendMail({
      to: ALERT_RECIPIENTS,
      subject: `[${status}] Carga de servicios ${alert.attemptId}`,
      text,
    });

    this.logger.log(`Upload alert ${alert.attemptId} sent (${status})`);
  }

  private readServiceSummaries(buffer?: Buffer): ServiceSummary[] {
    if (!buffer) return [];

    try {
      const moduleRef = AdmZipModule as unknown as { default?: unknown };
      const constructor =
        typeof moduleRef === 'function' ? moduleRef : moduleRef.default;
      if (typeof constructor !== 'function') return [];

      const Zip = constructor as new (input: Buffer) => {
        getEntry(name: string): IZipEntry | null;
        getEntries(): IZipEntry[];
      };
      const zip = new Zip(buffer);
      const summary = zip.getEntry('visits-summary.json');
      if (summary && summary.header.size <= 256_000) {
        const parsed: unknown = JSON.parse(summary.getData().toString('utf8'));
        if (Array.isArray(parsed)) {
          return parsed
            .slice(0, 100)
            .map((item) => this.toServiceSummary(item));
        }
      }

      return zip
        .getEntries()
        .filter(
          (entry) =>
            !entry.isDirectory &&
            entry.entryName.toLowerCase().endsWith('/details.json') &&
            entry.header.size <= 256_000,
        )
        .slice(0, 100)
        .map((entry) => {
          try {
            return this.toServiceSummary(
              JSON.parse(entry.getData().toString('utf8')),
            );
          } catch {
            return this.toServiceSummary(null);
          }
        });
    } catch (error) {
      this.logger.warn(
        `Could not read upload summary: ${this.describeError(error)}`,
      );
      return [];
    }
  }

  private toServiceSummary(value: unknown): ServiceSummary {
    const data =
      value && typeof value === 'object'
        ? (value as Record<string, unknown>)
        : {};
    const display = (field: string) =>
      typeof data[field] === 'string' && data[field]
        ? String(data[field]).slice(0, 160)
        : 'No disponible';

    return {
      serviceNumber: display('serviceNumber'),
      collectorName: display('collectorName'),
      visitDate: display('visitDate'),
      serviceTime: display('serviceTime'),
    };
  }

  private readUploadResult(response: unknown): UploadResult {
    if (!response || typeof response !== 'object') return { records: 0 };

    const data = (response as { data?: unknown }).data;
    if (!data || typeof data !== 'object') return { records: 0 };

    const result = data as { package_id?: unknown; services?: unknown };
    return {
      packageId:
        typeof result.package_id === 'string' ? result.package_id : undefined,
      records: Array.isArray(result.services) ? result.services.length : 0,
    };
  }

  private describeError(error: unknown): string {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}`.slice(0, 500);
    }
    return 'Error no identificado';
  }
}
