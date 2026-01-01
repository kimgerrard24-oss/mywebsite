// backend/src/common/mappers/tag.mapper.ts
import { SearchTagItemDto } from '../../search/dto/search-tags.response.dto';

type RawTag = {
  id: string;
  name: string;
  postCount?: number;
};

export function mapTagToSearchDto(
  tag: RawTag,
): SearchTagItemDto {
  return {
    id: tag.id,
    name: tag.name,
    postCount: tag.postCount ?? 0,
  };
}
