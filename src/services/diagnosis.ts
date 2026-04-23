const mockDiagnoses = [
  {
    condition: "Mancha foliar fúngica",
    confidence: 0.91,
    treatment:
      "Retira hojas afectadas, evita mojar el follaje al regar y aplica fungicida de cobre cada 7 días por 3 semanas."
  },
  {
    condition: "Estrés hídrico por riego irregular",
    confidence: 0.87,
    treatment:
      "Riega cuando los primeros 2 cm de sustrato estén secos. Mantén un calendario y mejora el drenaje de la maceta."
  },
  {
    condition: "Deficiencia de nitrógeno",
    confidence: 0.84,
    treatment:
      "Aplica fertilizante balanceado (NPK) a media dosis cada 15 días y revisa el pH del sustrato entre 6.0 y 6.8."
  },
  {
    condition: "Plaga de ácaros",
    confidence: 0.89,
    treatment:
      "Limpia hojas con agua jabonosa suave y aplica jabón potásico o aceite de neem cada 5 días por 3 aplicaciones."
  }
];

export function getMockDiagnosis(imageUri: string) {
  const seed = imageUri.length % mockDiagnoses.length;
  return mockDiagnoses[seed];
}
