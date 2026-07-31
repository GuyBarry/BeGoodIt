import { ClothingItemDto, PaginatedClothingItemsDto } from '../dtos';
import { ClothingFilters } from '../repositories';
import { backgroundRemovalService } from './backgroundRemoval.service';
import { imagesService } from './images.service';
import { AddItemInput, clothingItemService } from './clothingItem.service';
import { classifyClothingItem } from '../ai/classifyClothingItem';
import { generateEmbedding } from '../ai/ai.provider';
import { BadRequestException } from '../exceptions/httpExceptions';
import { garmentCategoryRepository, colorGroupRepository, seasonRepository } from '../repositories';

const getItemsByUserId = async (
  userId: string,
  filters: ClothingFilters,
  page: number,
  limit: number,
): Promise<PaginatedClothingItemsDto> => {
  return clothingItemService.getFilteredByUserId(userId, filters, page, limit);
};

const addToCloset = async (
  userId: string,
  file: Express.Multer.File,
  tags: AddItemInput = {},
): Promise<ClothingItemDto> => {
  const processedFile = await backgroundRemovalService.removeBackground(file);

  // Classify first so we can reject non-clothing images before committing any DB writes
  const classification = await classifyClothingItem({
    mimeType: processedFile.mimetype,
    data: processedFile.buffer,
  }).catch(() => null);

  if (classification?.noClothingDetected === true) {
    throw new BadRequestException('No clothing detected in image');
  }

  // Resolve classification names to DB IDs; caller-supplied tag IDs take priority.
  let categoryId     = tags.categoryId     ?? null;
  let colorGroupIds  = tags.colorGroupIds?.length ? tags.colorGroupIds : null;
  let seasonIds      = tags.seasonIds?.length     ? tags.seasonIds     : null;
  const styles       = tags.styles?.length        ? tags.styles        : (classification?.style ? [classification.style] : []);

  if (classification && !classification.noClothingDetected) {
    const [category, colorGroup, season] = await Promise.all([
      categoryId        == null ? garmentCategoryRepository.findOne({ where: { name: classification.category   } }) : null,
      colorGroupIds == null ? colorGroupRepository.findOne({      where: { name: classification.colorGroup } }) : null,
      seasonIds     == null ? seasonRepository.findOne({          where: { name: classification.season      } }) : null,
    ]);
    if (category)   categoryId    = category.id;
    if (colorGroup) colorGroupIds = [colorGroup.id];
    if (season)     seasonIds     = [season.id];
  }

  // Image save and embedding generation can now proceed in parallel
  const [imageDto, embedding] = await Promise.all([
    imagesService.saveImage(processedFile),
    classification?.description
      ? generateEmbedding(classification.description).catch(() => null)
      : Promise.resolve(null),
  ]);

  return clothingItemService.addItem(userId, imageDto.id, {
    categoryId,
    colorGroupIds: colorGroupIds ?? [],
    seasonIds: seasonIds ?? [],
    styles,
    embedding,
  });
};

const removeFromCloset = async (userId: string, itemId: string): Promise<void> => {
  return clothingItemService.deleteById(itemId, userId);
};

export const closetService = {
  getItemsByUserId,
  addToCloset,
  removeFromCloset,
};

