import { ServiceEntry } from '@domain/entities';
import {
  IServiceEntryAccessReadRepository,
  IServiceEntrySurveyReadRepository,
} from '@domain/ports/repositories';
import {
  ServiceEntryInteractionStatusDto,
  ServiceEntryDownloadStatusDto,
  ServiceEntrySurveyStatusDto,
} from '@application/dto';

export function createEmptyServiceEntryInteractionStatus(): ServiceEntryInteractionStatusDto {
  return {
    surveyStatus: {
      completed: false,
      submittedAt: null,
    },
    downloadStatus: {
      hasDownload: false,
      lastDownloadedAt: null,
      downloadCount: 0,
    },
  };
}

export async function buildInteractionStatusForEntries(params: {
  entries: ServiceEntry[];
  accessReadRepository: IServiceEntryAccessReadRepository;
  surveyReadRepository: IServiceEntrySurveyReadRepository;
}): Promise<Map<string, ServiceEntryInteractionStatusDto>> {
  const { entries, accessReadRepository, surveyReadRepository } = params;
  const map = new Map<string, ServiceEntryInteractionStatusDto>();

  if (entries.length === 0) {
    return map;
  }

  const serviceEntryIds = entries.map((entry) => entry.id);

  const [{ data: accessRecords }, { data: surveys }] = await Promise.all([
    accessReadRepository.findByServiceEntryIds(serviceEntryIds),
    surveyReadRepository.findByServiceEntryIds(serviceEntryIds),
  ]);

  const accessByEntry = new Map(
    accessRecords.map((access) => [access.serviceEntryId, access]),
  );
  const surveyByEntry = new Map(
    surveys.map((survey) => [survey.serviceEntryId, survey]),
  );

  entries.forEach((entry) => {
    const access = accessByEntry.get(entry.id);
    const survey = surveyByEntry.get(entry.id);

    const surveyStatus: ServiceEntrySurveyStatusDto = {
      completed: !!survey,
      submittedAt: survey?.submittedAt ?? null,
    };

    const downloadStatus: ServiceEntryDownloadStatusDto = {
      hasDownload:
        !!access &&
        ((access.downloadCount ?? 0) > 0 || access.downloadedAt !== null),
      lastDownloadedAt: access?.downloadedAt ?? null,
      downloadCount: access?.downloadCount ?? 0,
    };

    map.set(entry.id, {
      surveyStatus,
      downloadStatus,
    });
  });

  return map;
}

export async function buildInteractionStatusForEntry(params: {
  entry: ServiceEntry;
  accessReadRepository: IServiceEntryAccessReadRepository;
  surveyReadRepository: IServiceEntrySurveyReadRepository;
}): Promise<ServiceEntryInteractionStatusDto> {
  const { entry, accessReadRepository, surveyReadRepository } = params;

  const [{ data: access }, { data: survey }] = await Promise.all([
    accessReadRepository.findByServiceEntryId(entry.id),
    surveyReadRepository.findByServiceEntryId(entry.id),
  ]);

  return {
    surveyStatus: {
      completed: !!survey,
      submittedAt: survey?.submittedAt ?? null,
    },
    downloadStatus: {
      hasDownload:
        !!access &&
        ((access.downloadCount ?? 0) > 0 || access.downloadedAt !== null),
      lastDownloadedAt: access?.downloadedAt ?? null,
      downloadCount: access?.downloadCount ?? 0,
    },
  };
}
