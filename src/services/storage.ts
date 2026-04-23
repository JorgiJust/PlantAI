import AsyncStorage from "@react-native-async-storage/async-storage";
import { PlantRecord } from "../types";

const STORAGE_KEY = "@plant_doctor_records";

export async function loadRecords(): Promise<PlantRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as PlantRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveRecords(records: PlantRecord[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}
