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
  let categoryId   = tags.categoryId   ?? null;
  let colorGroupId = tags.colorGroupId ?? null;
  let seasonId     = tags.seasonId     ?? null;
  const style      = tags.style        ?? classification?.style ?? null;

  if (classification && !classification.noClothingDetected) {
    const [category, colorGroup, season] = await Promise.all([
      categoryId   == null ? garmentCategoryRepository.findOne({ where: { name: classification.category   } }) : null,
      colorGroupId == null ? colorGroupRepository.findOne({      where: { name: classification.colorGroup } }) : null,
      seasonId     == null ? seasonRepository.findOne({          where: { name: classification.season      } }) : null,
    ]);
    if (category)   categoryId   = category.id;
    if (colorGroup) colorGroupId = colorGroup.id;
    if (season)     seasonId     = season.id;
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
    colorGroupId,
    seasonId,
    style,
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

