import type {
  ArchiveExperienceCommand,
  CreateExperienceCommand,
  DuplicateExperienceCommand,
  UpdateExperienceAvailabilityCommand,
  UpdateExperienceCoreCommand,
  UpdateExperienceExtrasCommand,
  UpdateExperienceMediaCommand,
  UpdateExperiencePublicationStateCommand,
} from "@/modules/experience-catalog/application/AdminExperienceDtos";
import type {
  CreateManualCalendarBlockCommand,
  GetAdminCalendarQuery,
  ReleaseManualCalendarBlockCommand,
} from "@/modules/boat-calendar/application/AdminCalendarDtos";
import type {
  BackpanelCancelBookingCommand,
  BackpanelCreateBookingCommand,
  BackpanelIssueBookingAccessLinkCommand,
  BackpanelUpdateBookingCommand,
} from "@/modules/booking/application/AdminBookingDtos";
import { BookingCalendarSyncService } from "@/modules/booking/application/BookingCalendarSyncService";
import { BackpanelCancelBookingUseCase } from "@/modules/booking/application/BackpanelCancelBookingUseCase";
import { BackpanelCreateBookingUseCase } from "@/modules/booking/application/BackpanelCreateBookingUseCase";
import { BackpanelIssueBookingAccessLinkUseCase } from "@/modules/booking/application/BackpanelIssueBookingAccessLinkUseCase";
import { BackpanelUpdateBookingUseCase } from "@/modules/booking/application/BackpanelUpdateBookingUseCase";
import { CreatePublicBookingCheckoutUseCase } from "@/modules/booking/application/CreatePublicBookingCheckoutUseCase";
import type { SaveCancellationPolicyCommand } from "@/modules/booking/application/AdminCancellationPolicyDtos";
import { GetAdminCancellationPoliciesWorkspaceUseCase } from "@/modules/booking/application/GetAdminCancellationPoliciesWorkspaceUseCase";
import { GetAdminBookingsWorkspaceUseCase } from "@/modules/booking/application/GetAdminBookingsWorkspaceUseCase";
import { GetPublicBookingPageUseCase } from "@/modules/booking/application/GetPublicBookingPageUseCase";
import { GetPublicBookingCheckoutReturnUseCase } from "@/modules/booking/application/GetPublicBookingCheckoutReturnUseCase";
import { HandleDepositPaymentWebhookUseCase } from "@/modules/booking/application/HandleDepositPaymentWebhookUseCase";
import { IssueBookingAccessLinkUseCase } from "@/modules/booking/application/IssueBookingAccessLinkUseCase";
import { ReconcileBookingCalendarSyncUseCase } from "@/modules/booking/application/ReconcileBookingCalendarSyncUseCase";
import { SaveCancellationPolicyUseCase } from "@/modules/booking/application/SaveCancellationPolicyUseCase";
import { ViewBookingByAccessTokenUseCase } from "@/modules/booking/application/ViewBookingByAccessTokenUseCase";
import type { ViewBookingByAccessTokenQuery } from "@/modules/booking/application/BookingAccessDtos";
import type {
  GetPublicBookingAvailabilityQuery,
  GetPublicBookingPageQuery,
} from "@/modules/booking/application/PublicBookingDtos";
import type { DepositPaymentProvider } from "@/modules/booking/application/ports/DepositPaymentProvider";
import type {
  CreatePublicBookingCheckoutCommand,
  GetPublicBookingCheckoutReturnQuery,
  HandleDepositPaymentWebhookCommand,
  PreviewPublicBookingCouponCommand,
} from "@/modules/booking/application/PublicCheckoutDtos";
import type {
  ChangeAdminCouponStatusCommand,
  CreateAdminCouponCommand,
  UpdateAdminCouponCommand,
} from "@/modules/coupons/application/AdminCouponDtos";
import { ChangeAdminCouponStatusUseCase } from "@/modules/coupons/application/ChangeAdminCouponStatusUseCase";
import { ConfirmCouponRedemptionUseCase } from "@/modules/coupons/application/ConfirmCouponRedemptionUseCase";
import { CreateAdminCouponUseCase } from "@/modules/coupons/application/CreateAdminCouponUseCase";
import { GetAdminCouponsWorkspaceUseCase } from "@/modules/coupons/application/GetAdminCouponsWorkspaceUseCase";
import { PreviewCouponDiscountUseCase } from "@/modules/coupons/application/PreviewCouponDiscountUseCase";
import { ReleaseCouponRedemptionUseCase } from "@/modules/coupons/application/ReleaseCouponRedemptionUseCase";
import { ReserveCouponRedemptionUseCase } from "@/modules/coupons/application/ReserveCouponRedemptionUseCase";
import { UpdateAdminCouponUseCase } from "@/modules/coupons/application/UpdateAdminCouponUseCase";
import { CreateManualCalendarBlockUseCase } from "@/modules/boat-calendar/application/CreateManualCalendarBlockUseCase";
import { GetAdminCalendarUseCase } from "@/modules/boat-calendar/application/GetAdminCalendarUseCase";
import { ReleaseManualCalendarBlockUseCase } from "@/modules/boat-calendar/application/ReleaseManualCalendarBlockUseCase";
import type {
  ArchiveExtraCommand,
  CreateExtraCommand,
  UpdateExtraCommand,
} from "@/modules/experience-catalog/application/AdminExtraDtos";
import { ArchiveExperienceUseCase } from "@/modules/experience-catalog/application/ArchiveExperienceUseCase";
import { ArchiveExtraUseCase } from "@/modules/experience-catalog/application/ArchiveExtraUseCase";
import { CreateExperienceUseCase } from "@/modules/experience-catalog/application/CreateExperienceUseCase";
import { CreateExtraUseCase } from "@/modules/experience-catalog/application/CreateExtraUseCase";
import { DuplicateExperienceUseCase } from "@/modules/experience-catalog/application/DuplicateExperienceUseCase";
import { GetAdminExperiencesWorkspaceUseCase } from "@/modules/experience-catalog/application/GetAdminExperiencesWorkspaceUseCase";
import { GetAdminExtrasWorkspaceUseCase } from "@/modules/experience-catalog/application/GetAdminExtrasWorkspaceUseCase";
import { UpdateExperienceAvailabilityUseCase } from "@/modules/experience-catalog/application/UpdateExperienceAvailabilityUseCase";
import { UpdateExperienceCoreUseCase } from "@/modules/experience-catalog/application/UpdateExperienceCoreUseCase";
import { UpdateExperienceExtrasUseCase } from "@/modules/experience-catalog/application/UpdateExperienceExtrasUseCase";
import { UpdateExperienceMediaUseCase } from "@/modules/experience-catalog/application/UpdateExperienceMediaUseCase";
import { UpdateExperiencePublicationStateUseCase } from "@/modules/experience-catalog/application/UpdateExperiencePublicationStateUseCase";
import { UpdateExtraUseCase } from "@/modules/experience-catalog/application/UpdateExtraUseCase";
import { GetPublishedHomeGalleryUseCase } from "@/modules/home-gallery/application/GetPublishedHomeGalleryUseCase";
import { RotateHomeGalleryUseCase } from "@/modules/home-gallery/application/RotateHomeGalleryUseCase";
import type { UpdateLocalizedExperienceContentCommand } from "@/modules/localization-seo/application/LocalizedExperienceContentDtos";
import { UpdateLocalizedExperienceContentUseCase } from "@/modules/localization-seo/application/UpdateLocalizedExperienceContentUseCase";
import type {
  RequestMediaReprocessCommand,
  UpdateMediaAssetMetadataCommand,
  UploadMediaAssetCommand,
} from "@/modules/media-library/application/AdminMediaDtos";
import { GetAdminMediaAssetUseCase } from "@/modules/media-library/application/GetAdminMediaAssetUseCase";
import { ListAdminMediaAssetsUseCase } from "@/modules/media-library/application/ListAdminMediaAssetsUseCase";
import { ProcessNextMediaProcessingJobUseCase } from "@/modules/media-library/application/ProcessNextMediaProcessingJobUseCase";
import { RequestMediaReprocessUseCase } from "@/modules/media-library/application/RequestMediaReprocessUseCase";
import { UpdateMediaAssetMetadataUseCase } from "@/modules/media-library/application/UpdateMediaAssetMetadataUseCase";
import { UploadMediaAssetUseCase } from "@/modules/media-library/application/UploadMediaAssetUseCase";
import type { MediaStorage } from "@/modules/media-library/application/ports/MediaStorage";
import type { MediaVariantGenerator } from "@/modules/media-library/application/ports/MediaVariantGenerator";
import type {
  PreviewNotificationTemplateCommand,
  ProcessOutboxNotificationEventCommand,
  SendBookingNotificationCommand,
  UpdateNotificationRuleCommand,
  UpdateNotificationTemplateCommand,
} from "@/modules/notifications/application/NotificationDtos";
import { GetAdminNotificationsWorkspaceUseCase } from "@/modules/notifications/application/GetAdminNotificationsWorkspaceUseCase";
import { PreviewNotificationTemplateUseCase } from "@/modules/notifications/application/PreviewNotificationTemplateUseCase";
import { ProcessNextNotificationWorkUseCase } from "@/modules/notifications/application/ProcessNextNotificationWorkUseCase";
import { ProcessOutboxNotificationEventUseCase } from "@/modules/notifications/application/ProcessOutboxNotificationEventUseCase";
import { SendBookingNotificationUseCase } from "@/modules/notifications/application/SendBookingNotificationUseCase";
import { UpdateNotificationRuleUseCase } from "@/modules/notifications/application/UpdateNotificationRuleUseCase";
import { UpdateNotificationTemplateUseCase } from "@/modules/notifications/application/UpdateNotificationTemplateUseCase";

import { CryptoCalendarBlockIdGenerator } from "./infrastructure/calendar/CryptoCalendarBlockIdGenerator";
import { SystemCalendarClock } from "./infrastructure/calendar/SystemCalendarClock";
import { createBookingCalendarPublisherFromEnv } from "./infrastructure/calendar/BookingCalendarPublisherFactory";
import { CryptoBookingIdGenerator } from "./infrastructure/booking/CryptoBookingIdGenerator";
import { CryptoBookingAccessTokenService } from "./infrastructure/booking/CryptoBookingAccessTokenService";
import { createPublicBookingAccessUrlBuilderFromEnv } from "./infrastructure/booking/PublicBookingAccessUrlBuilder";
import { SystemBookingClock } from "./infrastructure/booking/SystemBookingClock";
import { PrismaBookingAccessRepository } from "./infrastructure/db/prisma/PrismaBookingAccessRepository";
import type { PrismaBookingAccessRepositoryClient } from "./infrastructure/db/prisma/PrismaBookingAccessRepository";
import { PrismaBookingRepository } from "./infrastructure/db/prisma/PrismaBookingRepository";
import type { PrismaBookingRepositoryClient } from "./infrastructure/db/prisma/PrismaBookingRepository";
import { PrismaCancellationPolicyRepository } from "./infrastructure/db/prisma/PrismaCancellationPolicyRepository";
import type { PrismaCancellationPolicyRepositoryClient } from "./infrastructure/db/prisma/PrismaCancellationPolicyRepository";
import { PrismaCalendarBlockRepository } from "./infrastructure/db/prisma/PrismaCalendarBlockRepository";
import type { PrismaCalendarBlockRepositoryClient } from "./infrastructure/db/prisma/PrismaCalendarBlockRepository";
import { PrismaCouponRepository } from "./infrastructure/db/prisma/PrismaCouponRepository";
import type { PrismaCouponRepositoryClient } from "./infrastructure/db/prisma/PrismaCouponRepository";
import { PrismaExperienceRepository } from "./infrastructure/db/prisma/PrismaExperienceRepository";
import type { PrismaExperienceRepositoryClient } from "./infrastructure/db/prisma/PrismaExperienceRepository";
import { PrismaExtraRepository } from "./infrastructure/db/prisma/PrismaExtraRepository";
import type { PrismaExtraRepositoryClient } from "./infrastructure/db/prisma/PrismaExtraRepository";
import { PrismaHomeGalleryRepository } from "./infrastructure/db/prisma/PrismaHomeGalleryRepository";
import type { PrismaHomeGalleryRepositoryClient } from "./infrastructure/db/prisma/PrismaHomeGalleryRepository";
import { PrismaLocalizedExperienceContentRepository } from "./infrastructure/db/prisma/PrismaLocalizedExperienceContentRepository";
import type { PrismaLocalizedExperienceContentClient } from "./infrastructure/db/prisma/PrismaLocalizedExperienceContentRepository";
import { PrismaMediaAssetRepository } from "./infrastructure/db/prisma/PrismaMediaAssetRepository";
import type { PrismaMediaAssetRepositoryClient } from "./infrastructure/db/prisma/PrismaMediaAssetRepository";
import { PrismaMediaLibraryUnitOfWork } from "./infrastructure/db/prisma/PrismaMediaLibraryUnitOfWork";
import type { PrismaMediaLibraryUnitOfWorkClient } from "./infrastructure/db/prisma/PrismaMediaLibraryUnitOfWork";
import { PrismaNotificationAuditRepository } from "./infrastructure/db/prisma/PrismaNotificationAuditRepository";
import type { PrismaNotificationAuditRepositoryClient } from "./infrastructure/db/prisma/PrismaNotificationAuditRepository";
import { PrismaNotificationBookingReader } from "./infrastructure/db/prisma/PrismaNotificationBookingReader";
import type { PrismaNotificationBookingReaderClient } from "./infrastructure/db/prisma/PrismaNotificationBookingReader";
import { PrismaNotificationDeliveryRepository } from "./infrastructure/db/prisma/PrismaNotificationDeliveryRepository";
import type { PrismaNotificationDeliveryRepositoryClient } from "./infrastructure/db/prisma/PrismaNotificationDeliveryRepository";
import { PrismaNotificationOutboxRepository } from "./infrastructure/db/prisma/PrismaNotificationOutboxRepository";
import type { PrismaNotificationOutboxRepositoryClient } from "./infrastructure/db/prisma/PrismaNotificationOutboxRepository";
import { PrismaNotificationRuleRepository } from "./infrastructure/db/prisma/PrismaNotificationRuleRepository";
import type { PrismaNotificationRuleRepositoryClient } from "./infrastructure/db/prisma/PrismaNotificationRuleRepository";
import { PrismaNotificationTemplateRepository } from "./infrastructure/db/prisma/PrismaNotificationTemplateRepository";
import type { PrismaNotificationTemplateRepositoryClient } from "./infrastructure/db/prisma/PrismaNotificationTemplateRepository";
import { PrismaPublicBookingCatalogReader } from "./infrastructure/db/prisma/PrismaPublicBookingCatalogReader";
import type { PrismaPublicBookingCatalogReaderClient } from "./infrastructure/db/prisma/PrismaPublicBookingCatalogReader";
import { getPrismaClient } from "./infrastructure/db/prisma/prismaClient";
import { CryptoHomeGalleryIdGenerator } from "./infrastructure/home-gallery/CryptoHomeGalleryIdGenerator";
import { SystemHomeGalleryClock } from "./infrastructure/home-gallery/SystemHomeGalleryClock";
import { CryptoMediaIdGenerator } from "./infrastructure/media/CryptoMediaIdGenerator";
import { createSharpLocalMediaVariantGeneratorFromEnv } from "./infrastructure/media/SharpLocalMediaVariantGenerator";
import { SystemMediaClock } from "./infrastructure/media/SystemMediaClock";
import { CryptoNotificationIdGenerator } from "./infrastructure/notifications/CryptoNotificationIdGenerator";
import { createNotificationProviderFromEnv } from "./infrastructure/notifications/NotificationProviderFactory";
import { SimpleTemplateRenderer } from "./infrastructure/notifications/SimpleTemplateRenderer";
import { StaticNotificationPreviewFixtureProvider } from "./infrastructure/notifications/StaticNotificationPreviewFixtureProvider";
import { SystemNotificationClock } from "./infrastructure/notifications/SystemNotificationClock";
import { createStripeDepositPaymentProviderFromEnv } from "./infrastructure/payments/StripeDepositPaymentProvider";
import { createLocalMediaStorageFromEnv } from "./infrastructure/storage/local/LocalMediaStorage";

const adminLocales = ["en", "es", "ca"] as const;

export function getContainer() {
  const prisma = getPrismaClient();
  const experienceRepository = new PrismaExperienceRepository(
    prisma as unknown as PrismaExperienceRepositoryClient,
  );
  const extraRepository = new PrismaExtraRepository(
    prisma as unknown as PrismaExtraRepositoryClient,
  );
  const localizedContentRepository =
    new PrismaLocalizedExperienceContentRepository(
      prisma as unknown as PrismaLocalizedExperienceContentClient,
    );
  const mediaAssetRepository = new PrismaMediaAssetRepository(
    prisma as unknown as PrismaMediaAssetRepositoryClient,
  );
  const homeGalleryRepository = new PrismaHomeGalleryRepository(
    prisma as unknown as PrismaHomeGalleryRepositoryClient,
  );
  const calendarBlockRepository = new PrismaCalendarBlockRepository(
    prisma as unknown as PrismaCalendarBlockRepositoryClient,
  );
  const bookingRepository = new PrismaBookingRepository(
    prisma as unknown as PrismaBookingRepositoryClient,
  );
  const bookingAccessRepository = new PrismaBookingAccessRepository(
    prisma as unknown as PrismaBookingAccessRepositoryClient,
  );
  const cancellationPolicyRepository = new PrismaCancellationPolicyRepository(
    prisma as unknown as PrismaCancellationPolicyRepositoryClient,
  );
  const couponRepository = new PrismaCouponRepository(
    prisma as unknown as PrismaCouponRepositoryClient,
  );
  const publicBookingCatalogReader = new PrismaPublicBookingCatalogReader(
    prisma as unknown as PrismaPublicBookingCatalogReaderClient,
  );
  const notificationRuleRepository = new PrismaNotificationRuleRepository(
    prisma as unknown as PrismaNotificationRuleRepositoryClient,
  );
  const notificationTemplateRepository =
    new PrismaNotificationTemplateRepository(
      prisma as unknown as PrismaNotificationTemplateRepositoryClient,
    );
  const notificationDeliveryRepository =
    new PrismaNotificationDeliveryRepository(
      prisma as unknown as PrismaNotificationDeliveryRepositoryClient,
    );
  const notificationOutboxRepository = new PrismaNotificationOutboxRepository(
    prisma as unknown as PrismaNotificationOutboxRepositoryClient,
  );
  const notificationBookingReader = new PrismaNotificationBookingReader(
    prisma as unknown as PrismaNotificationBookingReaderClient,
  );
  const notificationAuditRepository = new PrismaNotificationAuditRepository(
    prisma as unknown as PrismaNotificationAuditRepositoryClient,
  );
  const mediaUnitOfWork = new PrismaMediaLibraryUnitOfWork(
    prisma as unknown as PrismaMediaLibraryUnitOfWorkClient,
  );
  const mediaClock = new SystemMediaClock();
  const mediaIds = new CryptoMediaIdGenerator();
  const homeGalleryClock = new SystemHomeGalleryClock();
  const homeGalleryIds = new CryptoHomeGalleryIdGenerator();
  const calendarClock = new SystemCalendarClock();
  const calendarIds = new CryptoCalendarBlockIdGenerator();
  const bookingClock = new SystemBookingClock();
  const bookingIds = new CryptoBookingIdGenerator();
  const bookingAccessTokens = new CryptoBookingAccessTokenService();
  const bookingAccessUrlBuilder = createPublicBookingAccessUrlBuilderFromEnv();
  const notificationClock = new SystemNotificationClock();
  const notificationIds = new CryptoNotificationIdGenerator();
  const notificationRenderer = new SimpleTemplateRenderer();
  const notificationProvider = createNotificationProviderFromEnv();
  const notificationPreviewFixtures =
    new StaticNotificationPreviewFixtureProvider();
  const depositPaymentProvider = createLazyDepositPaymentProvider();
  const mediaStorage = createLazyLocalMediaStorage();
  const mediaVariantGenerator = createLazyLocalMediaVariantGenerator();
  const bookingCalendarPublisher = createBookingCalendarPublisherFromEnv();
  const bookingCalendarSync = new BookingCalendarSyncService(
    bookingRepository,
    bookingCalendarPublisher,
    bookingClock,
  );
  const previewCouponDiscountUseCase = new PreviewCouponDiscountUseCase(
    couponRepository,
  );
  const reserveCouponRedemptionUseCase = new ReserveCouponRedemptionUseCase(
    couponRepository,
  );
  const confirmCouponRedemptionUseCase = new ConfirmCouponRedemptionUseCase(
    couponRepository,
  );
  const releaseCouponRedemptionUseCase = new ReleaseCouponRedemptionUseCase(
    couponRepository,
  );
  const getAdminCouponsWorkspaceUseCase = new GetAdminCouponsWorkspaceUseCase(
    couponRepository,
    experienceRepository,
  );
  const createAdminCouponUseCase = new CreateAdminCouponUseCase(
    couponRepository,
  );
  const updateAdminCouponUseCase = new UpdateAdminCouponUseCase(
    couponRepository,
  );
  const changeAdminCouponStatusUseCase = new ChangeAdminCouponStatusUseCase(
    couponRepository,
  );
  const reconcileBookingCalendarSyncUseCase =
    new ReconcileBookingCalendarSyncUseCase(
      bookingRepository,
      bookingCalendarSync,
    );

  const getWorkspaceUseCase = new GetAdminExperiencesWorkspaceUseCase(
    experienceRepository,
    extraRepository,
    localizedContentRepository,
    cancellationPolicyRepository,
  );
  const createExperienceUseCase = new CreateExperienceUseCase(
    experienceRepository,
    extraRepository,
  );
  const updateCoreUseCase = new UpdateExperienceCoreUseCase(
    experienceRepository,
    extraRepository,
    localizedContentRepository,
  );
  const updateAvailabilityUseCase = new UpdateExperienceAvailabilityUseCase(
    experienceRepository,
    extraRepository,
    localizedContentRepository,
  );
  const updateExtrasUseCase = new UpdateExperienceExtrasUseCase(
    experienceRepository,
    extraRepository,
    localizedContentRepository,
  );
  const updateMediaUseCase = new UpdateExperienceMediaUseCase(
    experienceRepository,
    extraRepository,
    localizedContentRepository,
  );
  const updatePublicationStateUseCase =
    new UpdateExperiencePublicationStateUseCase(
      experienceRepository,
      extraRepository,
      localizedContentRepository,
    );
  const archiveExperienceUseCase = new ArchiveExperienceUseCase(
    experienceRepository,
    extraRepository,
    localizedContentRepository,
  );
  const duplicateExperienceUseCase = new DuplicateExperienceUseCase(
    experienceRepository,
    extraRepository,
  );
  const updateLocalizedExperienceContentUseCase =
    new UpdateLocalizedExperienceContentUseCase(localizedContentRepository);
  const getAdminExtrasWorkspaceUseCase = new GetAdminExtrasWorkspaceUseCase(
    extraRepository,
  );
  const createExtraUseCase = new CreateExtraUseCase(extraRepository);
  const updateExtraUseCase = new UpdateExtraUseCase(extraRepository);
  const archiveExtraUseCase = new ArchiveExtraUseCase(extraRepository);
  const listAdminMediaAssetsUseCase = new ListAdminMediaAssetsUseCase(
    mediaAssetRepository,
  );
  const getAdminMediaAssetUseCase = new GetAdminMediaAssetUseCase(
    mediaAssetRepository,
  );
  const uploadMediaAssetUseCase = new UploadMediaAssetUseCase(
    mediaUnitOfWork,
    mediaStorage,
    mediaIds,
    mediaClock,
  );
  const updateMediaAssetMetadataUseCase = new UpdateMediaAssetMetadataUseCase(
    mediaAssetRepository,
    mediaClock,
  );
  const requestMediaReprocessUseCase = new RequestMediaReprocessUseCase(
    mediaUnitOfWork,
    mediaIds,
    mediaClock,
  );
  const processNextMediaProcessingJobUseCase =
    new ProcessNextMediaProcessingJobUseCase(
      mediaUnitOfWork,
      mediaVariantGenerator,
      mediaClock,
    );
  const getPublishedHomeGalleryUseCase = new GetPublishedHomeGalleryUseCase(
    homeGalleryRepository,
    homeGalleryRepository,
  );
  const rotateHomeGalleryUseCase = new RotateHomeGalleryUseCase(
    homeGalleryRepository,
    homeGalleryRepository,
    homeGalleryIds,
    homeGalleryClock,
  );
  const getAdminCalendarUseCase = new GetAdminCalendarUseCase(
    calendarBlockRepository,
  );
  const createManualCalendarBlockUseCase = new CreateManualCalendarBlockUseCase(
    calendarBlockRepository,
    calendarIds,
    calendarClock,
  );
  const releaseManualCalendarBlockUseCase =
    new ReleaseManualCalendarBlockUseCase(
      calendarBlockRepository,
      calendarClock,
    );
  const getAdminBookingsWorkspaceUseCase = new GetAdminBookingsWorkspaceUseCase(
    bookingRepository,
  );
  const backpanelCreateBookingUseCase = new BackpanelCreateBookingUseCase(
    bookingRepository,
    bookingIds,
    bookingClock,
    cancellationPolicyRepository,
    bookingCalendarSync,
  );
  const backpanelUpdateBookingUseCase = new BackpanelUpdateBookingUseCase(
    bookingRepository,
    bookingIds,
    bookingClock,
    bookingCalendarSync,
  );
  const backpanelCancelBookingUseCase = new BackpanelCancelBookingUseCase(
    bookingRepository,
    bookingClock,
    bookingCalendarSync,
  );
  const getPublicBookingPageUseCase = new GetPublicBookingPageUseCase(
    publicBookingCatalogReader,
    bookingClock,
  );
  const createPublicBookingCheckoutUseCase =
    new CreatePublicBookingCheckoutUseCase(
      bookingRepository,
      bookingIds,
      bookingClock,
      depositPaymentProvider,
      cancellationPolicyRepository,
      reserveCouponRedemptionUseCase,
    );
  const getAdminCancellationPoliciesWorkspaceUseCase =
    new GetAdminCancellationPoliciesWorkspaceUseCase(
      cancellationPolicyRepository,
    );
  const saveCancellationPolicyUseCase = new SaveCancellationPolicyUseCase(
    cancellationPolicyRepository,
  );
  const handleDepositPaymentWebhookUseCase =
    new HandleDepositPaymentWebhookUseCase(
      bookingRepository,
      bookingClock,
      depositPaymentProvider,
      bookingCalendarSync,
      confirmCouponRedemptionUseCase,
      releaseCouponRedemptionUseCase,
    );
  const issueBookingAccessLinkUseCase = new IssueBookingAccessLinkUseCase(
    bookingAccessRepository,
    bookingAccessTokens,
    bookingAccessTokens,
    bookingAccessUrlBuilder,
  );
  const getPublicBookingCheckoutReturnUseCase =
    new GetPublicBookingCheckoutReturnUseCase(
      bookingRepository,
      issueBookingAccessLinkUseCase,
      bookingClock,
    );
  const viewBookingByAccessTokenUseCase = new ViewBookingByAccessTokenUseCase(
    bookingAccessRepository,
    bookingAccessTokens,
    bookingClock,
  );
  const backpanelIssueBookingAccessLinkUseCase =
    new BackpanelIssueBookingAccessLinkUseCase(
      bookingRepository,
      issueBookingAccessLinkUseCase,
      bookingClock,
    );
  const updateNotificationRuleUseCase = new UpdateNotificationRuleUseCase(
    notificationRuleRepository,
    notificationTemplateRepository,
    notificationAuditRepository,
    notificationIds,
    notificationClock,
  );
  const getAdminNotificationsWorkspaceUseCase =
    new GetAdminNotificationsWorkspaceUseCase(
      notificationRuleRepository,
      notificationTemplateRepository,
      notificationDeliveryRepository,
    );
  const updateNotificationTemplateUseCase =
    new UpdateNotificationTemplateUseCase(
      notificationTemplateRepository,
      notificationAuditRepository,
      notificationClock,
    );
  const previewNotificationTemplateUseCase =
    new PreviewNotificationTemplateUseCase(
      notificationTemplateRepository,
      notificationBookingReader,
      notificationPreviewFixtures,
      notificationRenderer,
    );
  const processOutboxNotificationEventUseCase =
    new ProcessOutboxNotificationEventUseCase(
      notificationOutboxRepository,
      notificationBookingReader,
      notificationRuleRepository,
      notificationTemplateRepository,
      notificationDeliveryRepository,
      notificationRenderer,
      notificationIds,
      notificationClock,
      issueBookingAccessLinkUseCase,
    );
  const sendBookingNotificationUseCase = new SendBookingNotificationUseCase(
    notificationDeliveryRepository,
    notificationProvider,
    notificationClock,
  );
  const processNextNotificationWorkUseCase =
    new ProcessNextNotificationWorkUseCase(
      notificationOutboxRepository,
      notificationDeliveryRepository,
      processOutboxNotificationEventUseCase,
      notificationProvider,
      notificationClock,
    );

  return {
    adminBookings: {
      cancelBackpanelBooking: (command: BackpanelCancelBookingCommand) =>
        backpanelCancelBookingUseCase.execute(command),
      createBackpanelBooking: (command: BackpanelCreateBookingCommand) =>
        backpanelCreateBookingUseCase.execute(command),
      getWorkspace: () => getAdminBookingsWorkspaceUseCase.execute(),
      issueAccessLink: (command: BackpanelIssueBookingAccessLinkCommand) =>
        backpanelIssueBookingAccessLinkUseCase.execute(command),
      updateBackpanelBooking: (command: BackpanelUpdateBookingCommand) =>
        backpanelUpdateBookingUseCase.execute(command),
    },
    adminCancellationPolicies: {
      getWorkspace: () =>
        getAdminCancellationPoliciesWorkspaceUseCase.execute(),
      savePolicy: (command: SaveCancellationPolicyCommand) =>
        saveCancellationPolicyUseCase.execute(command),
    },
    adminCalendar: {
      createManualBlock: (command: CreateManualCalendarBlockCommand) =>
        createManualCalendarBlockUseCase.execute(command),
      getCalendar: (query: GetAdminCalendarQuery) =>
        getAdminCalendarUseCase.execute(query),
      releaseManualBlock: (command: ReleaseManualCalendarBlockCommand) =>
        releaseManualCalendarBlockUseCase.execute(command),
    },
    adminExperiences: {
      archiveExperience: (command: ArchiveExperienceCommand) =>
        archiveExperienceUseCase.execute(command),
      createExperience: (command: CreateExperienceCommand) =>
        createExperienceUseCase.execute(command),
      duplicateExperience: (command: DuplicateExperienceCommand) =>
        duplicateExperienceUseCase.execute(command),
      getWorkspace: () =>
        getWorkspaceUseCase.execute({
          locales: [...adminLocales],
        }),
      updateAvailability: (command: UpdateExperienceAvailabilityCommand) =>
        updateAvailabilityUseCase.execute(command),
      updateCore: (command: UpdateExperienceCoreCommand) =>
        updateCoreUseCase.execute(command),
      updateExtras: (command: UpdateExperienceExtrasCommand) =>
        updateExtrasUseCase.execute(command),
      updateLocalizedContent: (
        command: UpdateLocalizedExperienceContentCommand,
      ) => updateLocalizedExperienceContentUseCase.execute(command),
      updateMedia: (command: UpdateExperienceMediaCommand) =>
        updateMediaUseCase.execute(command),
      updatePublicationState: (
        command: UpdateExperiencePublicationStateCommand,
      ) => updatePublicationStateUseCase.execute(command),
    },
    adminExtras: {
      archiveExtra: (command: ArchiveExtraCommand) =>
        archiveExtraUseCase.execute(command),
      createExtra: (command: CreateExtraCommand) =>
        createExtraUseCase.execute(command),
      getWorkspace: () => getAdminExtrasWorkspaceUseCase.execute(),
      updateExtra: (command: UpdateExtraCommand) =>
        updateExtraUseCase.execute(command),
    },
    adminCoupons: {
      changeStatus: (command: ChangeAdminCouponStatusCommand) =>
        changeAdminCouponStatusUseCase.execute(command),
      createCoupon: (command: CreateAdminCouponCommand) =>
        createAdminCouponUseCase.execute(command),
      getWorkspace: () => getAdminCouponsWorkspaceUseCase.execute(),
      updateCoupon: (command: UpdateAdminCouponCommand) =>
        updateAdminCouponUseCase.execute(command),
    },
    adminMedia: {
      getAsset: (assetId: string) => getAdminMediaAssetUseCase.execute(assetId),
      listAssets: () => listAdminMediaAssetsUseCase.execute(),
      requestReprocess: (command: RequestMediaReprocessCommand) =>
        requestMediaReprocessUseCase.execute(command),
      updateMetadata: (command: UpdateMediaAssetMetadataCommand) =>
        updateMediaAssetMetadataUseCase.execute(command),
      uploadAsset: (command: UploadMediaAssetCommand) =>
        uploadMediaAssetUseCase.execute(command),
    },
    adminHomeGallery: {
      rotateNow: () =>
        rotateHomeGalleryUseCase.execute({
          force: true,
          trigger: "MANUAL",
        }),
    },
    adminNotifications: {
      getWorkspace: () => getAdminNotificationsWorkspaceUseCase.execute(),
      previewTemplate: (command: PreviewNotificationTemplateCommand) =>
        previewNotificationTemplateUseCase.execute(command),
      processOutboxEvent: (command: ProcessOutboxNotificationEventCommand) =>
        processOutboxNotificationEventUseCase.execute(command),
      sendBookingNotification: (command: SendBookingNotificationCommand) =>
        sendBookingNotificationUseCase.execute(command),
      updateRule: (command: UpdateNotificationRuleCommand) =>
        updateNotificationRuleUseCase.execute(command),
      updateTemplate: (command: UpdateNotificationTemplateCommand) =>
        updateNotificationTemplateUseCase.execute(command),
    },
    mediaWorker: {
      processNextJob: () => processNextMediaProcessingJobUseCase.execute(),
    },
    homeGalleryWorker: {
      rotateIfDue: () =>
        rotateHomeGalleryUseCase.execute({
          trigger: "AUTOMATIC",
        }),
    },
    bookingCalendarSyncWorker: {
      reconcile: (input: { limit: number }) =>
        reconcileBookingCalendarSyncUseCase.execute(input),
    },
    notificationWorker: {
      processNextWork: () => processNextNotificationWorkUseCase.execute(),
    },
    publicBooking: {
      createCheckout: (command: CreatePublicBookingCheckoutCommand) =>
        createPublicBookingCheckoutUseCase.execute(command),
      getAvailability: (query: GetPublicBookingAvailabilityQuery) =>
        getPublicBookingPageUseCase.executeAvailability(query),
      getCheckoutReturn: (query: GetPublicBookingCheckoutReturnQuery) =>
        getPublicBookingCheckoutReturnUseCase.execute(query),
      getPage: (query: GetPublicBookingPageQuery) =>
        getPublicBookingPageUseCase.execute(query),
      handleDepositPaymentWebhook: (
        command: HandleDepositPaymentWebhookCommand,
      ) => handleDepositPaymentWebhookUseCase.execute(command),
      previewCoupon: (command: PreviewPublicBookingCouponCommand) =>
        previewCouponDiscountUseCase.execute({
          code: command.code,
          currency: "EUR",
          depositAmountMinor: command.depositAmountMinor,
          experienceId: command.experienceId,
          now: bookingClock.now(),
          subtotalAmountMinor: command.subtotalAmountMinor,
        }),
      viewBooking: (query: ViewBookingByAccessTokenQuery) =>
        viewBookingByAccessTokenUseCase.execute(query),
    },
    publicHomeGallery: {
      getPublished: () => getPublishedHomeGalleryUseCase.execute(),
    },
  };
}

export type AppContainer = ReturnType<typeof getContainer>;

function createLazyLocalMediaStorage(): MediaStorage {
  return {
    saveOriginal: (input) =>
      createLocalMediaStorageFromEnv().saveOriginal(input),
  };
}

function createLazyLocalMediaVariantGenerator(): MediaVariantGenerator {
  return {
    generateVariants: (input) =>
      createSharpLocalMediaVariantGeneratorFromEnv().generateVariants(input),
  };
}

function createLazyDepositPaymentProvider(): DepositPaymentProvider {
  return {
    createCheckoutSession: (command) =>
      createStripeDepositPaymentProviderFromEnv().createCheckoutSession(
        command,
      ),
    parseWebhook: (input) =>
      createStripeDepositPaymentProviderFromEnv().parseWebhook(input),
  };
}
