import { BodyMapping, BodyMappingDto } from '../db/entities';
import { bodyMappingRepository } from '../repositories';
import { imagesService } from './images.service';
import { BadRequestException } from '../exceptions/httpExceptions';

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

export const bodyService = {
  saveBodyImage,
};
