import { BodyMapping, BodyMappingDto } from '../db/entities';
import { bodyMappingRepository } from '../repositories';
import { imagesService } from './images.service';
import { BadRequestException, NotFoundException } from '../exceptions/httpExceptions';

export interface BodyDataInput {
  heightCm?: number | null;
  weightKg?: number | null;
  bodyType?: string | null;
}

const toDto = (body: BodyMapping): BodyMappingDto => ({
  id: body.id,
  userId: body.userId,
  imageId: body.imageId,
  picture: body.picture ?? null,
  heightCm: body.heightCm,
  weightKg: body.weightKg,
  bodyType: body.bodyType,
  createdAt: body.createdAt,
});

const saveBodyImage = async (
  file: Express.Multer.File,
  userId: string,
): Promise<BodyMappingDto> => {
  if (!userId || !userId.trim()) {
    throw new BadRequestException('userId is required');
  }

  const imageDto = await imagesService.saveImage(file);

  const existing = await bodyMappingRepository.findOne({ where: { userId } });

  if (existing) {
    existing.imageId = imageDto.id;
    const updated = await bodyMappingRepository.save(existing);
    return toDto(updated);
  }

  const bodyMapping = bodyMappingRepository.create({
    userId,
    imageId: imageDto.id,
    picture: null,
    heightCm: null,
    weightKg: null,
    bodyType: null,
  });

  const saved = await bodyMappingRepository.save(bodyMapping);
  return toDto(saved);
};

const saveBodyData = async (
  userId: string,
  data: BodyDataInput,
): Promise<BodyMappingDto> => {
  if (!userId || !userId.trim()) {
    throw new BadRequestException('userId is required');
  }

  const existing = await bodyMappingRepository.findOne({ where: { userId } });

  if (!existing) {
    throw new NotFoundException(`No body record found for user '${userId}'. Upload a body image first.`);
  }

  if (data.heightCm !== undefined) existing.heightCm = data.heightCm;
  if (data.weightKg !== undefined) existing.weightKg = data.weightKg;
  if (data.bodyType !== undefined) existing.bodyType = data.bodyType;

  const updated = await bodyMappingRepository.save(existing);
  return toDto(updated);
};

export const bodyService = {
  saveBodyImage,
  saveBodyData,
};
