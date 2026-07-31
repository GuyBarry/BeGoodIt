import { ClothingItem } from '../db/entities';
import { ClothingItemDto, PaginatedClothingItemsDto } from '../dtos';
import { NotFoundException } from '../exceptions/httpExceptions';
import { clothingItemRepository, ClothingFilters, styleRepository } from '../repositories';
import { classifyClothingItem, ClothingClassification } from '../ai/classifyClothingItem';
import { backgroundRemovalService } from './backgroundRemoval.service';
import { In } from 'typeorm';

const toDto = (item: ClothingItem): ClothingItemDto => ({
  id: item.id,
  userId: item.userId,
  imageId: item.imageId,
  styles: (item.styles ?? []).map(s => s.name),
  colorGroups: (item.colorGroups ?? []).map(cg => ({ id: cg.id, name: cg.name })),
  category: item.category ? { id: item.category.id, name: item.category.name } : null,
  seasons: (item.seasons ?? []).map(s => ({ id: s.id, name: s.name })),
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
  colorGroupIds?: number[];
  categoryId?: number | null;
  seasonIds?: number[];
  styles?: string[];
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
  // Resolve style names → Style entities
  const styleEntities = tags.styles?.length
    ? await styleRepository.find({ where: { name: In(tags.styles) } })
    : [];

  const item = clothingItemRepository.create({
    userId,
    imageId,
    categoryId: tags.categoryId ?? null,
    imageEmbedding: tags.embedding ? floatsToBuffer(tags.embedding) : null,
    colorGroups: (tags.colorGroupIds ?? []).map(id => ({ id } as any)),
    seasons: (tags.seasonIds ?? []).map(id => ({ id } as any)),
    styles: styleEntities,
  });
  const saved = await clothingItemRepository.save(item);
  // Reload with relations so toDto can populate category, colorGroups, seasons, styles
  const loaded = await clothingItemRepository.findOne({
    where: { id: saved.id },
    relations: ['category', 'colorGroups', 'seasons', 'styles'],
  });
  return toDto(loaded!);
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
