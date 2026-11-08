import { MEDIA_UI_MESSAGES } from '../../constants/mediaUiMessages';
import type { MediaType } from '../../types/media.types';
import { DetailsCreditSection } from './DetailsCreditSection';

export function ProductionDetails({
  mediaType,
  released,
  rated,
  country,
  language,
  boxOffice,
}: {
  mediaType: MediaType;
  released: string | null;
  rated: string | null;
  country: string | null;
  language: string | null;
  boxOffice: string | null;
}) {
  const boxOfficeCredit =
    mediaType === 'movie' && boxOffice !== null
      ? {
          label: MEDIA_UI_MESSAGES.details.boxOfficeLabel,
          value: boxOffice,
          mutedValue: true,
        }
      : null;
  return (
    <DetailsCreditSection
      testID="details-production-details"
      title={MEDIA_UI_MESSAGES.details.productionDetailsTitle}
      credits={[
        released
          ? {
              label: MEDIA_UI_MESSAGES.details.releasedLabel,
              value: released,
            }
          : null,
        rated
          ? {
              label: MEDIA_UI_MESSAGES.details.ratedLabel,
              value: rated,
            }
          : null,
        country
          ? {
              label: MEDIA_UI_MESSAGES.details.countryLabel,
              value: country,
            }
          : null,
        language
          ? {
              label: MEDIA_UI_MESSAGES.details.languageLabel,
              value: language,
            }
          : null,
        boxOfficeCredit,
      ]}
    />
  );
}
