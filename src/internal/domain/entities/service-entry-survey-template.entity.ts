export enum ServiceEntrySurveyQuestionType {
  RATING = 'RATING',
  TEXT = 'TEXT',
}

export interface ServiceEntrySurveyQuestion {
  id: string;
  text: string;
  type: ServiceEntrySurveyQuestionType;
  required: boolean;
  options?: string[];
  weight?: number;
}

export interface ServiceEntrySurveyTemplateProps {
  id: string;
  name: string;
  version: number;
  category: string | null;
  isDefault: boolean;
  questions: ServiceEntrySurveyQuestion[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class ServiceEntrySurveyTemplate {
  constructor(private readonly props: ServiceEntrySurveyTemplateProps) {}

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get version(): number {
    return this.props.version;
  }

  get category(): string | null {
    return this.props.category;
  }

  get isDefault(): boolean {
    return this.props.isDefault;
  }

  get questions(): ServiceEntrySurveyQuestion[] {
    return this.props.questions;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
}
