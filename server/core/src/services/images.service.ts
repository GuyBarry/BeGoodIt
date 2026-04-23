import { Image, ImageDto } from "../db/entities";
import { imageRepository } from "../repositories";
import { NotFoundException } from "../exceptions/httpExceptions";

const toDto = (image: Image): ImageDto => ({
  id: image.id,
  mimeType: image.mimeType,
  originalName: image.originalName,
  size: image.size,
  createdAt: image.createdAt,
});

const saveImage = async (file: Express.Multer.File): Promise<ImageDto> => {
  const image = imageRepository.create({
    data: file.buffer,
    mimeType: file.mimetype,
    originalName: file.originalname,
    size: file.size,
  });

  const saved = await imageRepository.save(image);
  return toDto(saved);
};

const getImageById = async (id: string): Promise<Image> => {
  const image = await imageRepository.findOne({ where: { id } });

  if (!image) {
    throw new NotFoundException(`Image with id '${id}' not found`);
  }

  return image;
};

export const imagesService = {
  saveImage,
  getImageById,
};
