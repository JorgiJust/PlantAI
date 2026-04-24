import AsyncStorage from "@react-native-async-storage/async-storage";
import { PlantRecord } from "../types";

const STORAGE_KEY = "@plant_doctor_records";
const TOKEN_BALANCE_KEY = "@plant_doctor_token_balance";

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

export async function loadTokenBalance(defaultValue: number): Promise<number> {
  const raw = await AsyncStorage.getItem(TOKEN_BALANCE_KEY);
  if (!raw) return defaultValue;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

export async function saveTokenBalance(balance: number): Promise<void> {
  await AsyncStorage.setItem(TOKEN_BALANCE_KEY, String(balance));
}
