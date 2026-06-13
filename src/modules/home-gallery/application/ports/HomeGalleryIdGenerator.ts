export type HomeGalleryIdGenerator = {
  newHomeGalleryCompositionId(): string;
  newHomeGalleryCompositionSlotId(input: {
    compositionId: string;
    position: number;
  }): string;
};
