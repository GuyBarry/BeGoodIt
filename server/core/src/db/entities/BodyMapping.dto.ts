export interface BodyMappingDto {
  id: string;
  userId: string;
  imageId: string;
  picture: string | null;
  heightCm: number | null;
  weightKg: number | null;
  bodyType: string | null;
  createdAt: Date;
}
