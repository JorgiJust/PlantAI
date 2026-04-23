export type PlantRecord = {
  id: string;
  imageUri: string;
  condition: string;
  confidence: number;
  treatment: string;
  rating?: number;
  createdAt: string;
};
