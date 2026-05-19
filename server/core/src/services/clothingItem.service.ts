import { ClothingItem } from '../db/entities';
import { ClothingItemDto, PaginatedClothingItemsDto } from '../dtos';
import { NotFoundException } from '../exceptions/httpExceptions';
import { clothingItemRepository, ClothingFilters } from '../repositories';
import { classifyClothingItem, ClothingClassification } from '../ai/classifyClothingItem';
import { backgroundRemovalService } from './backgroundRemoval.service';

const toDto = (item: ClothingItem): ClothingItemDto => ({
  id: item.id,
  userId: item.userId,
  imageId: item.imageId,
  style: item.style,
  colorGroup: item.colorGroup ? { id: item.colorGroup.id, name: item.colorGroup.name } : null,
  category: item.category ? { id: item.category.id, name: item.category.name } : null,
  season: item.season ? { id: item.season.id, name: item.season.name } : null,
  createdAt: item.createdAt,
});

const getFilteredByUserId = async (
  userId: string,
  filters: ClothingFilters,
  page: number,
  limit: number,
): Promise<PaginatedClothingItemsDto> => {
  const { items, total } = await clothingItemRepository.getFilteredByUserId(userId, filters, page, limit);
  return { items: items.map(toDto), total };
};

const deleteById = async (id: string, userId: string): Promise<void> => {
  const deleted = await clothingItemRepository.deleteByIdAndUserId(id, userId);
  if (!deleted) {
    throw new NotFoundException(`Clothing item not found`);
  }
};

const getMultipleByIds = async (ids: string[]): Promise<ClothingItem[]> => {
  return clothingItemRepository.getMultipleByIds(ids);
};

export interface AddItemInput {
  colorGroupId?: number | null;
  categoryId?: number | null;
  seasonId?: number | null;
  style?: string | null;
  embedding?: number[] | null;
}

export const EMBEDDING_DIM = 768;
export const EMBEDDING_BYTES = EMBEDDING_DIM * 4;

export function floatsToBuffer(floats: number[]): Buffer {
  const buf = Buffer.allocUnsafe(floats.length * 4);
  floats.forEach((v, i) => buf.writeFloatLE(v, i * 4));
  return buf;
}

export function bufferToFloats(buf: Buffer): number[] {
  const out: number[] = new Array(buf.length / 4);
  for (let i = 0; i < out.length; i++) out[i] = buf.readFloatLE(i * 4);
  return out;
}

const addItem = async (userId: string, imageId: string, tags: AddItemInput = {}): Promise<ClothingItemDto> => {
  const item = clothingItemRepository.create({
    userId,
    imageId,
    colorGroupId: tags.colorGroupId ?? null,
    categoryId: tags.categoryId ?? null,
    seasonId: tags.seasonId ?? null,
    style: tags.style ?? null,
    imageEmbedding: tags.embedding ? floatsToBuffer(tags.embedding) : null,
  });
  const saved = await clothingItemRepository.save(item);
  return toDto(saved);
};

const classifyItem = async (file: Express.Multer.File): Promise<ClothingClassification> => {
  let imageFile = file;
  try {
    imageFile = await backgroundRemovalService.removeBackground(file);
  } catch {
    // fall back to original image if background removal fails
  }
  return classifyClothingItem({ mimeType: imageFile.mimetype, data: imageFile.buffer });
};

export const clothingItemService = {
  getFilteredByUserId,
  getMultipleByIds,
  deleteById,
  addItem,
  classifyItem,
};
