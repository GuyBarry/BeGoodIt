import { ClothingItemDto, PaginatedClothingItemsDto } from '../dtos';
import { ClothingFilters } from '../repositories';
import { backgroundRemovalService } from './backgroundRemoval.service';
import { imagesService } from './images.service';
import { AddItemInput, clothingItemService } from './clothingItem.service';
import { classifyClothingItem, ClothingClassification } from '../ai/classifyClothingItem';
import { isolateGarment } from '../ai/prompt.manager';
import { generateEmbedding } from '../ai/ai.provider';
import { BadRequestException, ConflictException } from '../exceptions/httpExceptions';
import { garmentCategoryRepository, colorGroupRepository, seasonRepository, outfitRepository } from '../repositories';

const getItemsByUserId = async (
  userId: string,
  filters: ClothingFilters,
  page: number,
  limit: number,
): Promise<PaginatedClothingItemsDto> => {
  return clothingItemService.getFilteredByUserId(userId, filters, page, limit);
};

export type AddToClosetOptions = {
  // When true (Smart Buy adds), the source image is usually a model wearing the
  // garment; isolate just the garment into a clean catalog shot before storing.
  extractGarment?: boolean;
  itemDescription?: string;
};

const addToCloset = async (
  userId: string,
  file: Express.Multer.File,
  tags: AddItemInput = {},
  options: AddToClosetOptions = {},
): Promise<ClothingItemDto> => {
  let sourceFile = file;
  let classification: ClothingClassification | null = null;

  if (options.extractGarment) {
    // Detect whether the image is a model/worn shot before deciding to isolate.
    // Isolation is an expensive image-generation call, so we skip it entirely for
    // images that are already a clean standalone product shot.
    const detection = await classifyClothingItem({ mimeType: file.mimetype, data: file.buffer }).catch(() => null);

    if (detection?.isWornByModel) {
      try {
        const isolated = await isolateGarment(file, options.itemDescription);
        sourceFile = {
          ...file,
          buffer: isolated,
          mimetype: 'image/png',
          size: isolated.length,
          originalname: file.originalname.replace(/\.[^/.]+$/, '_item.png'),
        };
        // Image changed — leave classification null so we re-classify the clean
        // garment below (more accurate colours/category than the model shot).
      } catch (error) {
        // Isolation is best-effort: on failure, keep the original image and reuse
        // the detection classification rather than blocking the add.
        console.error('Garment isolation failed, using original image:', error);
        classification = detection;
      }
    } else {
      // Already a clean single-item shot: skip isolation and reuse this classification.
      classification = detection;
    }
  }

  const processedFile = await backgroundRemovalService.removeBackground(sourceFile);

  // Classify the processed image unless we already have a usable classification
  // (a clean single-item shot that didn't need isolation). This also rejects
  // non-clothing images before committing any DB writes.
  if (!classification) {
    classification = await classifyClothingItem({
      mimeType: processedFile.mimetype,
      data: processedFile.buffer,
    }).catch(() => null);
  }

  if (classification?.noClothingDetected === true) {
    throw new BadRequestException('No clothing detected in image');
  }

  // Resolve classification names to DB IDs; caller-supplied tag IDs take priority.
  let categoryId     = tags.categoryId     ?? null;
  let colorGroupIds  = tags.colorGroupIds?.length ? tags.colorGroupIds : null;
  let seasonIds      = tags.seasonIds?.length     ? tags.seasonIds     : null;
  const styles       = tags.styles?.length        ? tags.styles        : (classification?.styles?.length ? [...classification.styles] : []);

  if (classification && !classification.noClothingDetected) {
    const [category, colorGroups, seasons] = await Promise.all([
      categoryId    == null ? garmentCategoryRepository.findOne({ where: { name: classification.category } }) : null,
      colorGroupIds == null ? colorGroupRepository.find({ where: classification.colorGroups.map(name => ({ name })) }) : null,
      seasonIds     == null ? seasonRepository.find({     where: classification.seasons.map(name => ({ name })) })    : null,
    ]);
    if (category)              categoryId    = category.id;
    if (colorGroups?.length)   colorGroupIds = colorGroups.map(cg => cg.id);
    if (seasons?.length)       seasonIds     = seasons.map(s => s.id);
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

export type RemoveFromClosetOptions = {
  // When true, outfits containing this item are deleted along with it instead
  // of blocking the delete with a conflict.
  removeOutfits?: boolean;
};

const removeFromCloset = async (
  userId: string,
  itemId: string,
  options: RemoveFromClosetOptions = {},
): Promise<void> => {
  const outfitsWithItem = await outfitRepository.findByItemId(itemId, userId);

  if (outfitsWithItem.length > 0) {
    if (!options.removeOutfits) {
      throw new ConflictException('This item is used in one or more outfits', {
        outfits: outfitsWithItem.map(o => ({ id: o.id, name: o.name, imageId: o.imageId })),
      });
    }
    await outfitRepository.deleteManyByIdsAndUserId(outfitsWithItem.map(o => o.id), userId);
  }

  return clothingItemService.deleteById(itemId, userId);
};

export const closetService = {
  getItemsByUserId,
  addToCloset,
  removeFromCloset,
};

