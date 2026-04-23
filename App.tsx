import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { getMockDiagnosis } from "./src/services/diagnosis";
import { loadRecords, saveRecords } from "./src/services/storage";
import { PlantRecord } from "./src/types";

const palette = {
  background: "#F4EBDC",
  card: "#FFF8EC",
  primary: "#2D6A4F",
  secondary: "#5A8F74",
  text: "#2A3A32",
  muted: "#6B7E74",
  accent: "#DCE8D8",
  white: "#FFFFFF"
};

export default function App() {
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [records, setRecords] = useState<PlantRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"diagnostico" | "resultado" | "historial" | "tokens">(
    "diagnostico"
  );
  const [currentDiagnosisId, setCurrentDiagnosisId] = useState<string | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(3);
  const [popup, setPopup] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "info" | "success"
  });

  useEffect(() => {
    void (async () => {
      const currentRecords = await loadRecords();
      setRecords(currentRecords);
    })();
  }, []);

  const showPopup = (title: string, message: string, type: "info" | "success" = "info") => {
    setPopup({
      visible: true,
      title,
      message,
      type
    });
  };

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showPopup("Permiso requerido", "Necesitamos acceso a tus fotos para continuar.");
      return false;
    }
    return true;
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showPopup("Permiso requerido", "Necesitamos acceso a la camara para tomar fotos.");
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const granted = await requestPermission();
    if (!granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1]
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const granted = await requestCameraPermission();
    if (!granted) return;

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1]
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  const runDiagnosis = async () => {
    if (!selectedImageUri) {
      showPopup("Sin foto", "Primero selecciona una foto de la planta.");
      return;
    }

    setIsLoading(true);
    setTimeout(async () => {
      const diagnosis = getMockDiagnosis(selectedImageUri);
      const newRecord: PlantRecord = {
        id: `${Date.now()}`,
        imageUri: selectedImageUri,
        condition: diagnosis.condition,
        confidence: diagnosis.confidence,
        treatment: diagnosis.treatment,
        createdAt: new Date().toISOString()
      };
      const updatedRecords = [newRecord, ...records];
      setRecords(updatedRecords);
      await saveRecords(updatedRecords);
      setIsLoading(false);
      setCurrentDiagnosisId(newRecord.id);
      setShowRating(false);
      setActiveTab("resultado");
      showPopup("Diagnostico listo", "Se analizo la planta y te llevamos al resultado.", "success");
    }, 1200);
  };

  const displayedDiagnosis =
    records.find((record) => record.id === currentDiagnosisId) ?? records[0] ?? null;

  const handleRateDiagnosis = async (rating: number) => {
    if (!displayedDiagnosis) return;
    const updatedRecords = records.map((record) =>
      record.id === displayedDiagnosis.id ? { ...record, rating } : record
    );
    setRecords(updatedRecords);
    setCurrentDiagnosisId(displayedDiagnosis.id);
    await saveRecords(updatedRecords);
    showPopup("Gracias por calificar", `Guardamos una calificacion de ${rating} estrellas.`, "success");
  };

  const tokenPackages = [
    { id: "starter", tokens: 5, price: "$1.99" },
    { id: "plus", tokens: 15, price: "$4.99" },
    { id: "pro", tokens: 40, price: "$9.99" }
  ];

  const handleBuyTokens = (amount: number, price: string) => {
    setTokenBalance((prev) => prev + amount);
    showPopup("Compra realizada", `Compraste ${amount} tokens por ${price}.`, "success");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <Modal transparent visible={popup.visible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{popup.title}</Text>
            <Text style={styles.modalMessage}>{popup.message}</Text>
            <TouchableOpacity
              style={[
                styles.modalButton,
                popup.type === "success" ? styles.modalButtonSuccess : styles.modalButtonInfo
              ]}
              onPress={() => setPopup((prev) => ({ ...prev, visible: false }))}
            >
              <Text style={styles.modalButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>plantAI</Text>
          <Text style={styles.subtitle}>Diagnostico inteligente para tus plantas</Text>

            {activeTab === "diagnostico" && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>1) Carga una foto</Text>
              <View style={styles.rowButtons}>
                <TouchableOpacity style={styles.mainButton} onPress={takePhoto}>
                  <Text style={styles.mainButtonText}>Tomar foto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButtonTop} onPress={pickImage}>
                  <Text style={styles.secondaryButtonText}>Galeria</Text>
                </TouchableOpacity>
              </View>

              {selectedImageUri ? (
                <Image source={{ uri: selectedImageUri }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholder}>
                  <Text style={styles.placeholderText}>Aun no hay imagen seleccionada</Text>
                </View>
              )}

              <Text style={styles.sectionTitle}>2) Ejecutar analisis</Text>
              <TouchableOpacity style={styles.secondaryButton} onPress={runDiagnosis}>
                <Text style={styles.secondaryButtonText}>Diagnosticar</Text>
              </TouchableOpacity>
            </View>
          )}

            {isLoading && activeTab === "diagnostico" && (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color={palette.primary} />
                <Text style={styles.loadingText}>Analizando imagen...</Text>
              </View>
            )}

          {activeTab === "resultado" && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Resultado del diagnostico</Text>
              {!displayedDiagnosis ? (
                <Text style={styles.emptyHistory}>
                  Aun no hay resultados. Ve al tab de diagnostico para analizar una planta.
                </Text>
              ) : (
                <>
                  <Image source={{ uri: displayedDiagnosis.imageUri }} style={styles.previewImage} />
                  <Text style={styles.resultCondition}>{displayedDiagnosis.condition}</Text>
                  <Text style={styles.resultConfidence}>
                    Confianza: {Math.round(displayedDiagnosis.confidence * 100)}%
                  </Text>
                  <Text style={styles.resultTreatment}>{displayedDiagnosis.treatment}</Text>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => setShowRating((prev) => !prev)}
                  >
                    <Text style={styles.secondaryButtonText}>Calificar resultado</Text>
                  </TouchableOpacity>

                  {showRating && (
                    <View style={styles.ratingBlock}>
                      <Text style={styles.ratingTitle}>Tu feedback</Text>
                      <View style={styles.ratingStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <TouchableOpacity
                            key={star}
                            accessibilityLabel={`Calificar con ${star} estrellas`}
                            onPress={() => void handleRateDiagnosis(star)}
                          >
                            <Ionicons
                              name={(displayedDiagnosis.rating ?? 0) >= star ? "star" : "star-outline"}
                              size={30}
                              color="#E3A008"
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>
          )}

          {activeTab === "tokens" && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Comprar tokens</Text>
              <Text style={styles.tokensBalance}>Tokens disponibles: {tokenBalance}</Text>
              {tokenPackages.map((pack) => (
                <View style={styles.tokenItem} key={pack.id}>
                  <View>
                    <Text style={styles.tokenItemTitle}>{pack.tokens} tokens</Text>
                    <Text style={styles.tokenItemPrice}>{pack.price}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.buyButton}
                    onPress={() => handleBuyTokens(pack.tokens, pack.price)}
                  >
                    <Text style={styles.buyButtonText}>Comprar</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {activeTab === "historial" && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Historial guardado ({records.length})</Text>
              {records.length === 0 ? (
                <Text style={styles.emptyHistory}>No hay diagnosticos guardados todavia.</Text>
              ) : (
                records.slice(0, 20).map((record) => (
                  <View style={styles.historyItem} key={record.id}>
                    <Image source={{ uri: record.imageUri }} style={styles.historyImage} />
                    <View style={styles.historyContent}>
                      <Text style={styles.historyCondition}>{record.condition}</Text>
                      <Text style={styles.historyDate}>
                        {new Date(record.createdAt).toLocaleString("es-ES")}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomTabs}>
          <TouchableOpacity
            accessibilityLabel="Tab diagnostico"
            style={styles.bottomTabButton}
            onPress={() => setActiveTab("diagnostico")}
          >
            <Ionicons
              name={activeTab === "diagnostico" ? "leaf" : "leaf-outline"}
              size={24}
              color={activeTab === "diagnostico" ? palette.primary : palette.muted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="Tab historial"
            style={styles.bottomTabButton}
            onPress={() => setActiveTab("historial")}
          >
            <Ionicons
              name={activeTab === "historial" ? "time" : "time-outline"}
              size={24}
              color={activeTab === "historial" ? palette.primary : palette.muted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="Tab resultado"
            style={styles.bottomTabButton}
            onPress={() => setActiveTab("resultado")}
          >
            <Ionicons
              name={activeTab === "resultado" ? "checkmark-circle" : "checkmark-circle-outline"}
              size={24}
              color={activeTab === "resultado" ? palette.primary : palette.muted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="Tab tokens"
            style={styles.bottomTabButton}
            onPress={() => setActiveTab("tokens")}
          >
            <Ionicons
              name={activeTab === "tokens" ? "wallet" : "wallet-outline"}
              size={24}
              color={activeTab === "tokens" ? palette.primary : palette.muted}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background,
    paddingTop: Platform.OS === "android" ? 10 : 0
  },
  content: {
    flex: 1
  },
  container: {
    padding: 16,
    gap: 14,
    paddingTop: 22,
    paddingBottom: 150
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: palette.primary,
    marginTop: 4
  },
  subtitle: {
    fontSize: 16,
    color: palette.muted,
    marginBottom: 4
  },
  bottomTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderTopColor: palette.accent,
    paddingVertical: 10,
    paddingBottom: Platform.OS === "android" ? 20 : 14
  },
  bottomTabButton: {
    width: 56,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.accent
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: palette.text,
    marginBottom: 10
  },
  mainButton: {
    backgroundColor: palette.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
    flex: 1
  },
  rowButtons: {
    flexDirection: "row",
    gap: 10
  },
  secondaryButtonTop: {
    backgroundColor: palette.secondary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
    flex: 1
  },
  mainButtonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: "600"
  },
  secondaryButton: {
    backgroundColor: palette.secondary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8
  },
  secondaryButtonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: "600"
  },
  previewImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 4
  },
  placeholder: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: palette.accent,
    alignItems: "center",
    justifyContent: "center"
  },
  placeholderText: {
    color: palette.muted,
    textAlign: "center",
    paddingHorizontal: 16
  },
  loadingCard: {
    backgroundColor: palette.card,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.accent
  },
  loadingText: {
    marginTop: 8,
    color: palette.text
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(42,58,50,0.35)",
    padding: 24
  },
  modalCard: {
    width: "100%",
    backgroundColor: palette.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.accent
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.primary,
    marginBottom: 8
  },
  modalMessage: {
    color: palette.text,
    lineHeight: 22,
    marginBottom: 16
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center"
  },
  modalButtonInfo: {
    backgroundColor: palette.secondary
  },
  modalButtonSuccess: {
    backgroundColor: palette.primary
  },
  modalButtonText: {
    color: palette.white,
    fontWeight: "700"
  },
  emptyHistory: {
    color: palette.muted
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: palette.accent
  },
  historyImage: {
    width: 54,
    height: 54,
    borderRadius: 10
  },
  historyContent: {
    flex: 1
  },
  historyCondition: {
    fontWeight: "700",
    color: palette.text
  },
  historyDate: {
    color: palette.muted,
    fontSize: 12
  },
  resultCondition: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    color: palette.text
  },
  resultConfidence: {
    marginTop: 6,
    color: palette.secondary,
    fontWeight: "600"
  },
  resultTreatment: {
    marginTop: 10,
    color: palette.text,
    lineHeight: 22
  },
  ratingBlock: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: palette.accent
  },
  ratingTitle: {
    fontWeight: "700",
    color: palette.text,
    marginBottom: 8
  },
  ratingStars: {
    flexDirection: "row",
    gap: 8
  },
  tokensBalance: {
    color: palette.primary,
    fontWeight: "700",
    marginBottom: 12
  },
  tokenItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.accent
  },
  tokenItemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.text
  },
  tokenItemPrice: {
    marginTop: 4,
    color: palette.muted
  },
  buyButton: {
    backgroundColor: palette.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10
  },
  buyButtonText: {
    color: palette.white,
    fontWeight: "700"
  }
});
