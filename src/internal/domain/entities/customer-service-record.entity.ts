import { genId } from '@src/common/utils';
import { Entity } from '@src/internal/core/entities/entity';

export const CUSTOMER_SERVICE_RECORD_SERVICE_NUMBER_DISPLAY_WIDTH = 4;

export function formatCustomerServiceRecordServiceNumber(
  serviceNumber: number,
): string {
  return String(serviceNumber).padStart(
    CUSTOMER_SERVICE_RECORD_SERVICE_NUMBER_DISPLAY_WIDTH,
    '0',
  );
}

export enum CustomerServiceRecordStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}

export enum CustomerServiceRecordOperationalStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum CustomerServiceRecordBillingStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  SUBMITTED = 'SUBMITTED',
  INVOICED = 'INVOICED',
}

export enum CustomerServiceRecordInvoiceStatus {
  PENDING = 'PENDING',
  IN_PROCESS_PAYMENT = 'IN_PROCESS_PAYMENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export interface CustomerServiceRecordBillingProps {
  instructions: string | null;
  invoiceStatus: CustomerServiceRecordInvoiceStatus | null;
  issuedAt: string | null;
  deliveredAt: string | null;
  paymentTerm: CustomerServiceRecordIntervalProps | null;
  estimatedPaymentAt: string | null;
  paidAt: string | null;
}

export enum CustomerServiceRecordBillingNotificationStatus {
  NOT_REQUESTED = 'NOT_REQUESTED',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export interface CustomerServiceRecordBillingNotificationProps {
  status: CustomerServiceRecordBillingNotificationStatus;
  attemptedAt: Date | null;
  sentAt: Date | null;
  failureReason: string | null;
}

export enum CustomerServiceRecordMaterializationSource {
  SYSTEM = 'SYSTEM',
  POLICY = 'POLICY',
}

export enum CustomerServiceRecordNotificationTriggerEventStatus {
  PENDING = 'PENDING',
  TRIGGERED = 'TRIGGERED',
  FAILED = 'FAILED',
  INVALIDATED = 'INVALIDATED',
}

export enum CustomerServiceRecordProviderFollowUpEventStatus {
  PENDING = 'PENDING',
  TRIGGERED = 'TRIGGERED',
  FAILED = 'FAILED',
  INVALIDATED = 'INVALIDATED',
}

export interface CustomerServiceRecordIntervalProps {
  years: number;
  months: number;
  weeks: number;
  days: number;
}

export interface CustomerServiceRecordCustomerUserProps {
  userId: string;
  name: string;
  email: string;
}

export interface CustomerServiceRecordCustomerProps {
  customerId: string;
  customerName: string;
  users: CustomerServiceRecordCustomerUserProps[];
}

export interface CustomerServiceRecordFileAttachmentProps {
  fileId: string;
  originalName: string;
  mimeType: string;
  size: number;
  addedAt: Date;
  addedBy: string;
}

export interface CustomerServiceRecordRemovedFileAttachmentProps
  extends CustomerServiceRecordFileAttachmentProps {
  removedAt: Date;
  removedBy: string;
}

export interface CustomerServiceRecordFileAttachmentCollectionProps {
  files: CustomerServiceRecordFileAttachmentProps[];
  removedFiles: CustomerServiceRecordRemovedFileAttachmentProps[];
}

export interface CustomerServiceRecordDocumentProps
  extends CustomerServiceRecordFileAttachmentCollectionProps {
  referenceNumber: string | null;
}

export interface CustomerServiceRecordPaymentComplementProps
  extends CustomerServiceRecordDocumentProps {
  id: string;
}

export interface CustomerServiceRecordInvoiceProps
  extends CustomerServiceRecordDocumentProps {
  paymentComplements: CustomerServiceRecordPaymentComplementProps[];
}

export interface CustomerServiceRecordAssetProps {
  assetId?: string;
  name: string;
  identifier: string;
  brand: string;
  model: string;
  serialNumber: string;
  observations: string | null;
  intakeConditionFiles?: CustomerServiceRecordFileAttachmentCollectionProps;
  deliveryConditionFiles?: CustomerServiceRecordFileAttachmentCollectionProps;
  reports?: CustomerServiceRecordFileAttachmentCollectionProps;
}

export interface CustomerServiceRecordStatusMaterializationProps {
  source: CustomerServiceRecordMaterializationSource;
  code: string;
  effectiveStartDate: string | null;
  label: string;
  labelKey: string | null;
  colorHex: string;
  matchedRule: {
    sourceRuleId: string;
    startOffset: CustomerServiceRecordIntervalProps;
  } | null;
  lastMaterializedAt: Date;
}

export interface CustomerServiceRecordNotificationTriggerEventProps {
  triggerDate: string;
  status: CustomerServiceRecordNotificationTriggerEventStatus;
  triggeredAt: Date | null;
  failureReason: string | null;
}

export interface CustomerServiceRecordNotificationMaterializedRuleProps {
  sourceRuleId: string;
  anchor: string;
  startOffset: CustomerServiceRecordIntervalProps;
  triggerMode: string;
  repeatEvery: CustomerServiceRecordIntervalProps | null;
  repeatUntil: string | null;
  repeatFor: CustomerServiceRecordIntervalProps | null;
  triggerEvents: CustomerServiceRecordNotificationTriggerEventProps[];
  lastTriggeredAt: Date | null;
}

export interface CustomerServiceRecordNotificationMaterializationProps {
  source: CustomerServiceRecordMaterializationSource;
  nextTriggerDate: string | null;
  lastTriggeredAt: Date | null;
  materializedRulesCount: number;
  materializedRules: CustomerServiceRecordNotificationMaterializedRuleProps[];
  lastMaterializedAt: Date;
}

export interface CustomerServiceRecordProviderFollowUpRuleProps {
  ruleId?: string;
  interval: CustomerServiceRecordIntervalProps;
  recipientGroupIds: string[];
  ccRecipientGroupIds: string[];
}

export interface CustomerServiceRecordProviderFollowUpProps {
  enabled: boolean;
  rules: CustomerServiceRecordProviderFollowUpRuleProps[];
}

export interface CustomerServiceRecordProviderFollowUpMaterializationProps {
  source: 'EMBEDDED_RULE';
  sourceRuleId: string;
  triggerDate: string;
  status: CustomerServiceRecordProviderFollowUpEventStatus;
  triggeredAt: Date | null;
  failureReason: string | null;
  lastMaterializedAt: Date;
}

export interface CustomerServiceRecordCustomerDeliveryProps {
  receivedAt: string | null;
  estimatedDeliveryInterval: CustomerServiceRecordIntervalProps;
  estimatedDeliveryAt: string | null;
  deliveredToCustomerAt: string | null;
  statusPolicyId: string | null;
  notificationPolicyId: string | null;
  statusMaterialization: CustomerServiceRecordStatusMaterializationProps | null;
  notificationMaterialization: CustomerServiceRecordNotificationMaterializationProps | null;
}

export interface CustomerServiceRecordProviderProps {
  providerId: string;
  providerName: string;
  workOrderReference?: string | null;
  deliveredToProviderAt: string | null;
  estimatedReturnInterval: CustomerServiceRecordIntervalProps;
  estimatedReturnAt: string | null;
  returnedFromProviderAt: string | null;
  statusPolicyId: string | null;
  notificationPolicyId: string | null;
  followUp: CustomerServiceRecordProviderFollowUpProps;
  statusMaterialization: CustomerServiceRecordStatusMaterializationProps | null;
  notificationMaterialization: CustomerServiceRecordNotificationMaterializationProps | null;
  followUpMaterialization: CustomerServiceRecordProviderFollowUpMaterializationProps[];
}

export interface CustomerServiceRecordProps {
  id?: string;
  sourceServicePackageRecordId?: string | null;
  sourceServiceOrder?: string | null;
  serviceNumber: number;
  serviceTypeCode: string;
  serviceTypeName: string;
  requestedAt: string;
  observations: string | null;
  customer: CustomerServiceRecordCustomerProps;
  assets: CustomerServiceRecordAssetProps[];
  customerDelivery: CustomerServiceRecordCustomerDeliveryProps;
  provider?: CustomerServiceRecordProviderProps | null;
  quotation?: CustomerServiceRecordDocumentProps;
  purchaseOrder?: CustomerServiceRecordDocumentProps;
  invoice?: CustomerServiceRecordInvoiceProps;
  otherFiles?: CustomerServiceRecordFileAttachmentCollectionProps;
  attachmentsCount?: number;
  customerVisibleAttachmentsCount?: number;
  status?: CustomerServiceRecordStatus;
  operationalStatus?: CustomerServiceRecordOperationalStatus;
  billingStatus?: CustomerServiceRecordBillingStatus;
  billingNotification?: CustomerServiceRecordBillingNotificationProps;
  billing?: CustomerServiceRecordBillingProps;
  invoiceRevision?: number;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CustomerServiceRecord extends Entity<CustomerServiceRecordProps> {
  private readonly loadedInvoiceRevision: number;

  constructor(props: CustomerServiceRecordProps) {
    props.id = props.id ?? genId();
    props.sourceServicePackageRecordId =
      props.sourceServicePackageRecordId ?? null;
    props.sourceServiceOrder = props.sourceServiceOrder ?? null;
    props.observations = props.observations ?? null;
    props.status = props.status ?? CustomerServiceRecordStatus.ACTIVE;
    props.operationalStatus =
      props.operationalStatus ?? CustomerServiceRecordOperationalStatus.PENDING;
    props.billingStatus =
      props.billingStatus ?? CustomerServiceRecordBillingStatus.NOT_SUBMITTED;
    props.billingNotification = props.billingNotification ?? {
      status: CustomerServiceRecordBillingNotificationStatus.NOT_REQUESTED,
      attemptedAt: null,
      sentAt: null,
      failureReason: null,
    };
    props.assets = CustomerServiceRecord.normalizeAssets(props.assets ?? []);
    props.customerDelivery = CustomerServiceRecord.normalizeCustomerDelivery(
      props.customerDelivery,
    );
    props.provider = CustomerServiceRecord.normalizeProvider(
      props.provider ?? null,
    );
    props.quotation = CustomerServiceRecord.normalizeDocument(props.quotation);
    props.purchaseOrder = CustomerServiceRecord.normalizeDocument(
      props.purchaseOrder,
    );
    props.invoice = CustomerServiceRecord.normalizeInvoice(props.invoice);
    props.billing = CustomerServiceRecord.normalizeBilling(props.billing);
    props.invoiceRevision = Math.max(0, props.invoiceRevision ?? 0);
    props.otherFiles = CustomerServiceRecord.normalizeAttachmentCollection(
      props.otherFiles,
    );
    props.attachmentsCount = Math.max(0, props.attachmentsCount ?? 0);
    props.customerVisibleAttachmentsCount = Math.max(
      0,
      props.customerVisibleAttachmentsCount ?? 0,
    );
    props.createdBy = props.createdBy ?? null;
    props.updatedBy = props.updatedBy ?? null;
    super(props);
    this.loadedInvoiceRevision = props.invoiceRevision;
  }

  get id(): string {
    return this.props.id!;
  }
  get sourceServicePackageRecordId(): string | null {
    return this.props.sourceServicePackageRecordId ?? null;
  }
  get sourceServiceOrder(): string | null {
    return this.props.sourceServiceOrder ?? null;
  }
  get serviceNumber(): number {
    return this.props.serviceNumber;
  }
  get serviceNumberDisplay(): string {
    return formatCustomerServiceRecordServiceNumber(this.serviceNumber);
  }
  get serviceTypeCode(): string {
    return this.props.serviceTypeCode;
  }
  get serviceTypeName(): string {
    return this.props.serviceTypeName;
  }
  get requestedAt(): string {
    return this.props.requestedAt;
  }
  get observations(): string | null {
    return this.props.observations ?? null;
  }
  get customer(): CustomerServiceRecordCustomerProps {
    return structuredClone(this.props.customer);
  }
  get assets(): CustomerServiceRecordAssetProps[] {
    return structuredClone(this.props.assets);
  }
  get customerDelivery(): CustomerServiceRecordCustomerDeliveryProps {
    return structuredClone(this.props.customerDelivery);
  }
  get provider(): CustomerServiceRecordProviderProps | null {
    return this.props.provider ? structuredClone(this.props.provider) : null;
  }
  get quotation(): CustomerServiceRecordDocumentProps {
    return structuredClone(this.props.quotation!);
  }
  get purchaseOrder(): CustomerServiceRecordDocumentProps {
    return structuredClone(this.props.purchaseOrder!);
  }
  get invoice(): CustomerServiceRecordInvoiceProps {
    return structuredClone(this.props.invoice!);
  }
  get billing(): CustomerServiceRecordBillingProps {
    return structuredClone(this.props.billing!);
  }
  get invoiceRevision(): number {
    return this.props.invoiceRevision ?? 0;
  }
  archiveInvoice(updatedBy: string): void {
    this.props.invoice = CustomerServiceRecord.normalizeInvoice();
    this.props.billing = {
      ...this.billing,
      invoiceStatus: CustomerServiceRecordInvoiceStatus.PENDING,
      issuedAt: null,
      deliveredAt: null,
      paymentTerm: null,
      estimatedPaymentAt: null,
      paidAt: null,
    };
    this.props.invoiceRevision = this.invoiceRevision + 1;
    this.touch(updatedBy);
  }
  get originalInvoiceRevision(): number {
    return this.loadedInvoiceRevision;
  }
  get otherFiles(): CustomerServiceRecordFileAttachmentCollectionProps {
    return structuredClone(this.props.otherFiles!);
  }
  get attachmentsCount(): number {
    return this.props.attachmentsCount ?? 0;
  }
  get customerVisibleAttachmentsCount(): number {
    return this.props.customerVisibleAttachmentsCount ?? 0;
  }
  get status(): CustomerServiceRecordStatus {
    return this.props.status ?? CustomerServiceRecordStatus.ACTIVE;
  }
  get operationalStatus(): CustomerServiceRecordOperationalStatus {
    return (
      this.props.operationalStatus ??
      CustomerServiceRecordOperationalStatus.PENDING
    );
  }
  get billingStatus(): CustomerServiceRecordBillingStatus {
    return this.props.billingStatus!;
  }
  get billingNotification(): CustomerServiceRecordBillingNotificationProps {
    return structuredClone(this.props.billingNotification!);
  }

  updateBilling(
    status: CustomerServiceRecordBillingStatus,
    notification: CustomerServiceRecordBillingNotificationProps,
    updatedBy: string,
  ): void {
    this.props.billingStatus = status;
    this.props.billingNotification = structuredClone(notification);
    if (
      status === CustomerServiceRecordBillingStatus.SUBMITTED &&
      this.props.billing?.invoiceStatus === null
    ) {
      this.props.billing.invoiceStatus =
        CustomerServiceRecordInvoiceStatus.PENDING;
      this.props.invoiceRevision = this.invoiceRevision + 1;
    }
    this.touch(updatedBy);
  }
  updateBillingNotification(
    notification: CustomerServiceRecordBillingNotificationProps,
    updatedBy: string,
  ): void {
    this.props.billingNotification = structuredClone(notification);
    this.touch(updatedBy);
  }
  updateBillingInstructions(
    instructions: string | null,
    updatedBy: string,
  ): void {
    this.props.billing!.instructions = instructions;
    this.touch(updatedBy);
  }
  updateInvoiceBilling(
    billing: CustomerServiceRecordBillingProps,
    updatedBy: string,
  ): void {
    this.props.billing = CustomerServiceRecord.normalizeBilling(billing);
    this.props.invoiceRevision = this.invoiceRevision + 1;
    this.touch(updatedBy);
  }
  get createdBy(): string | null {
    return this.props.createdBy ?? null;
  }
  get updatedBy(): string | null {
    return this.props.updatedBy ?? null;
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
  get currentState(): CustomerServiceRecordProps {
    return this.props;
  }

  updateDetails(
    details: Partial<
      Omit<
        CustomerServiceRecordProps,
        | 'id'
        | 'serviceNumber'
        | 'createdBy'
        | 'createdAt'
        | 'billingStatus'
        | 'billingNotification'
      >
    >,
    updatedBy?: string | null,
  ): void {
    if (details.serviceTypeCode !== undefined)
      this.props.serviceTypeCode = details.serviceTypeCode;
    if (details.serviceTypeName !== undefined)
      this.props.serviceTypeName = details.serviceTypeName;
    if (details.requestedAt !== undefined)
      this.props.requestedAt = details.requestedAt;
    if (details.observations !== undefined)
      this.props.observations = details.observations;
    if (details.customer !== undefined) this.props.customer = details.customer;
    if (details.assets !== undefined)
      this.props.assets = CustomerServiceRecord.normalizeAssets(details.assets);
    if (details.customerDelivery !== undefined)
      this.props.customerDelivery =
        CustomerServiceRecord.normalizeCustomerDelivery(
          details.customerDelivery,
        );
    if (details.provider !== undefined)
      this.props.provider = CustomerServiceRecord.normalizeProvider(
        details.provider,
      );
    if (details.quotation !== undefined)
      this.props.quotation = CustomerServiceRecord.normalizeDocument(
        details.quotation,
      );
    if (details.purchaseOrder !== undefined)
      this.props.purchaseOrder = CustomerServiceRecord.normalizeDocument(
        details.purchaseOrder,
      );
    if (details.invoice !== undefined) {
      this.props.invoice = CustomerServiceRecord.normalizeInvoice(
        details.invoice,
      );
      this.props.invoiceRevision = this.invoiceRevision + 1;
    }
    if (details.otherFiles !== undefined)
      this.props.otherFiles =
        CustomerServiceRecord.normalizeAttachmentCollection(details.otherFiles);
    if (details.attachmentsCount !== undefined)
      this.props.attachmentsCount = Math.max(0, details.attachmentsCount);
    if (details.customerVisibleAttachmentsCount !== undefined)
      this.props.customerVisibleAttachmentsCount = Math.max(
        0,
        details.customerVisibleAttachmentsCount,
      );
    if (details.operationalStatus !== undefined)
      this.props.operationalStatus = details.operationalStatus;
    this.touch(updatedBy);
  }

  markAsDeleted(updatedBy?: string | null): void {
    this.props.status = CustomerServiceRecordStatus.DELETED;
    this.touch(updatedBy);
  }

  private touch(updatedBy?: string | null): void {
    if (updatedBy !== undefined) this.props.updatedBy = updatedBy;
    this.props.updatedAt = new Date();
  }

  private static normalizeInterval(
    value: CustomerServiceRecordIntervalProps,
  ): CustomerServiceRecordIntervalProps {
    return {
      years: Math.max(0, Math.trunc(value?.years ?? 0)),
      months: Math.max(0, Math.trunc(value?.months ?? 0)),
      weeks: Math.max(0, Math.trunc(value?.weeks ?? 0)),
      days: Math.max(0, Math.trunc(value?.days ?? 0)),
    };
  }

  private static normalizeAssets(
    assets: CustomerServiceRecordAssetProps[],
  ): CustomerServiceRecordAssetProps[] {
    const identifiers = new Set<string>();
    return assets.map((asset) => {
      const identifier = asset.identifier.trim();
      if (identifiers.has(identifier))
        throw new Error('Duplicated asset identifier');
      identifiers.add(identifier);
      return {
        ...asset,
        assetId: asset.assetId ?? genId(),
        identifier,
        observations: asset.observations ?? null,
        intakeConditionFiles:
          CustomerServiceRecord.normalizeAttachmentCollection(
            asset.intakeConditionFiles,
          ),
        deliveryConditionFiles:
          CustomerServiceRecord.normalizeAttachmentCollection(
            asset.deliveryConditionFiles,
          ),
        reports: CustomerServiceRecord.normalizeAttachmentCollection(
          asset.reports,
        ),
      };
    });
  }

  private static normalizeCustomerDelivery(
    value: CustomerServiceRecordCustomerDeliveryProps,
  ): CustomerServiceRecordCustomerDeliveryProps {
    return {
      ...value,
      estimatedDeliveryInterval: CustomerServiceRecord.normalizeInterval(
        value.estimatedDeliveryInterval,
      ),
      statusPolicyId: value.statusPolicyId ?? null,
      notificationPolicyId: value.notificationPolicyId ?? null,
      statusMaterialization: value.statusMaterialization ?? null,
      notificationMaterialization: value.notificationMaterialization ?? null,
    };
  }

  private static normalizeProvider(
    value: CustomerServiceRecordProviderProps | null,
  ): CustomerServiceRecordProviderProps | null {
    if (!value) return null;
    return {
      ...value,
      workOrderReference: value.workOrderReference ?? null,
      estimatedReturnInterval: CustomerServiceRecord.normalizeInterval(
        value.estimatedReturnInterval,
      ),
      statusPolicyId: value.statusPolicyId ?? null,
      notificationPolicyId: value.notificationPolicyId ?? null,
      followUp: {
        enabled: Boolean(value.followUp?.enabled),
        rules: (value.followUp?.rules ?? []).map((rule) => ({
          ...rule,
          ruleId: rule.ruleId ?? genId(),
          interval: CustomerServiceRecord.normalizeInterval(rule.interval),
          recipientGroupIds: [
            ...new Set(
              (rule.recipientGroupIds ?? [])
                .map((id) => id.trim())
                .filter(Boolean),
            ),
          ],
          ccRecipientGroupIds: [
            ...new Set(
              (rule.ccRecipientGroupIds ?? [])
                .map((id) => id.trim())
                .filter(Boolean),
            ),
          ],
        })),
      },
      statusMaterialization: value.statusMaterialization ?? null,
      notificationMaterialization: value.notificationMaterialization ?? null,
      followUpMaterialization: value.followUpMaterialization ?? [],
    };
  }

  private static normalizeDocument(
    value?: CustomerServiceRecordDocumentProps,
  ): CustomerServiceRecordDocumentProps {
    return {
      ...CustomerServiceRecord.normalizeAttachmentCollection(value),
      referenceNumber: value?.referenceNumber ?? null,
    };
  }

  private static normalizeInvoice(
    value?: CustomerServiceRecordInvoiceProps,
  ): CustomerServiceRecordInvoiceProps {
    return {
      ...CustomerServiceRecord.normalizeDocument(value),
      paymentComplements: (value?.paymentComplements ?? []).map((item) => ({
        ...CustomerServiceRecord.normalizeDocument(item),
        id: item.id ?? genId(),
      })),
    };
  }

  private static normalizeBilling(
    value?: CustomerServiceRecordBillingProps,
  ): CustomerServiceRecordBillingProps {
    return {
      instructions: value?.instructions ?? null,
      invoiceStatus: value?.invoiceStatus ?? null,
      issuedAt: value?.issuedAt ?? null,
      deliveredAt: value?.deliveredAt ?? null,
      paymentTerm: value?.paymentTerm
        ? CustomerServiceRecord.normalizeInterval(value.paymentTerm)
        : null,
      estimatedPaymentAt: value?.estimatedPaymentAt ?? null,
      paidAt: value?.paidAt ?? null,
    };
  }

  private static normalizeAttachmentCollection(
    value?: CustomerServiceRecordFileAttachmentCollectionProps,
  ): CustomerServiceRecordFileAttachmentCollectionProps {
    return {
      files: value?.files ?? [],
      removedFiles: value?.removedFiles ?? [],
    };
  }
}
