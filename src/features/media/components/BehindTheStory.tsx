import { MEDIA_UI_MESSAGES } from '../constants/mediaUiMessages';
import { DetailsCreditSection } from './DetailsCreditSection';

export function BehindTheStory({
  director,
  writer,
  actors,
}: {
  director: string | null;
  writer: string | null;
  actors: string | null;
}) {
  return (
    <DetailsCreditSection
      testID="details-behind-the-story"
      title={MEDIA_UI_MESSAGES.details.behindTheStoryTitle}
      credits={[
        director
          ? {
              label: MEDIA_UI_MESSAGES.details.directorLabel,
              value: director,
            }
          : null,
        writer
          ? {
              label: MEDIA_UI_MESSAGES.details.writerLabel,
              value: writer,
            }
          : null,
        actors
          ? {
              label: MEDIA_UI_MESSAGES.details.actorsLabel,
              value: actors,
            }
          : null,
      ]}
    />
  );
}
