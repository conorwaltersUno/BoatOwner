import React, { Dispatch, SetStateAction } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import MapView, { Polyline, Marker } from "react-native-maps";
import { LocationPoint, SaveLogDTO } from "../interfaces/log/log";
import { useSaveLog } from "@/hooks/useSaveLog";
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/ThemedText";

interface SaveLogModalProps {
  modalVisibility: boolean;
  setModalVisibility: Dispatch<SetStateAction<boolean>>;
  locations: LocationPoint[];
  startTime: Date | null;
  endTime: Date | null;
}

const SaveLogModal: React.FC<SaveLogModalProps> = ({
  modalVisibility,
  setModalVisibility,
  locations,
  startTime,
  endTime,
}) => {
  const { mutate: saveLog } = useSaveLog();
  const { theme } = useTheme();

  const validationSchema = Yup.object().shape({
    description: Yup.string().trim().required("Description is required."),
    crewMembers: Yup.array().of(Yup.string().trim().required("Crew member name cannot be empty.")),
  });

  const handleSave = (values: { description: string; crewMembers: string[] }) => {
    const log: SaveLogDTO = {
      description: values.description,
      crew_members: values.crewMembers,
      coordinates: locations,
      log_started: startTime,
      log_ended: endTime,
      created_on: new Date(),
    };
    saveLog(log);
    setModalVisibility(false);
  };

  const REPLAY_SPEEDS = [0.5, 1, 1.5, 2, 5, 10];
  const [replayIndex, setReplayIndex] = React.useState(0);
  const [isReplaying, setIsReplaying] = React.useState(false);
  const [replaySpeed, setReplaySpeed] = React.useState(1);
  const [mapRegion, setMapRegion] = React.useState<any>(undefined);
  const mapRef = React.useRef<MapView | null>(null);

  React.useEffect(() => {
    setReplayIndex(0);
    setIsReplaying(false);
    setReplaySpeed(1);
  }, [locations]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isReplaying && locations.length > 1) {
      interval = setInterval(() => {
        setReplayIndex(prev => {
          if (prev < locations.length - 1) {
            return prev + 1;
          } else {
            // Loop back to start
            return 0;
          }
        });
      }, Math.max(10, 100 / replaySpeed));
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReplaying, locations, replaySpeed]);

  return (
    <Modal visible={modalVisibility} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={() => setModalVisibility(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(30,40,60,0.18)' }] }>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              keyboardVerticalOffset={100}
              style={[styles.modalContainer, { backgroundColor: theme.background, borderColor: theme.border }]}
            >
              <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.innerContainer}>
                  <ThemedText style={[styles.modalTitle, { color: theme.primary }]}>Trip Summary</ThemedText>
                  <ThemedText style={[styles.dateText, { color: theme.text + '99' }]}>{new Date().toLocaleDateString()}</ThemedText>
                  <Formik
                    initialValues={{
                      description: "",
                      crewMembers: [""],
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values, { resetForm }) => {
                      handleSave(values);
                      resetForm();
                    }}
                  >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                      <>
                        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                          <View style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <TextInput
                              style={[styles.input, styles.textArea]}
                              placeholder="Describe your trip..."
                              value={values.description}
                              onChangeText={handleChange("description")}
                              onBlur={handleBlur("description")}
                              multiline
                              numberOfLines={4}
                              textAlignVertical="top"
                            />
                            {errors.description && touched.description && (
                              <Text style={styles.errorText}>Description cannot be empty.</Text>
                            )}
                          </View>
                          <View style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>Crew Members</Text>
                            {values.crewMembers.map((member, idx) => (
                              <View key={idx} style={styles.crewRow}>
                                <TextInput
                                  style={[styles.input, { flex: 1 }]}
                                  placeholder={`Crew Member ${idx + 1}`}
                                  value={member}
                                  onChangeText={(text) => {
                                    const updated = [...values.crewMembers];
                                    updated[idx] = text;
                                    setFieldValue("crewMembers", updated);
                                  }}
                                />
                                {idx > 0 && (
                                  <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => {
                                      const updated = values.crewMembers.filter((_, i) => i !== idx);
                                      setFieldValue("crewMembers", updated);
                                    }}
                                  >
                                    <Text style={styles.deleteButtonText}>🗑️</Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            ))}
                            <TouchableOpacity
                              onPress={() => {
                                setFieldValue("crewMembers", [...values.crewMembers, ""]);
                              }}
                              style={styles.addButton}
                            >
                              <Text style={styles.addButtonText}>+ Add Crew Member</Text>
                            </TouchableOpacity>
                            {Array.isArray(errors.crewMembers) &&
                              errors.crewMembers.some((err) => err) &&
                              touched.crewMembers && (
                                <Text style={styles.errorText}>Crew member name cannot be empty.</Text>
                              )}
                          </View>
                          <View style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>Route Map</Text>
                            <View style={{ marginBottom: 16 }}>
                              <MapView
                                ref={mapRef}
                                style={styles.map}
                                initialRegion={{
                                  latitude: locations[0]?.latitude || 37.78825,
                                  longitude: locations[0]?.longitude || -122.4324,
                                  latitudeDelta: 0.01,
                                  longitudeDelta: 0.01,
                                }}
                                region={mapRegion}
                                onRegionChangeComplete={region => setMapRegion(region)}
                              >
                                <Polyline coordinates={locations} strokeWidth={4} strokeColor="#2E66E7" />
                                {locations.length > 0 && (
                                  <Marker
                                    coordinate={locations[replayIndex]}
                                    pinColor="#E74C3C"
                                    title="Current Position"
                                  />
                                )}
                              </MapView>
                              {/* Replay Controls */}
                              {locations.length > 1 && (
                                <View style={{ marginTop: 10 }}>
                                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    {/* Play/Pause button to the left of the slider, smaller */}
                                    <TouchableOpacity
                                      onPress={() => setIsReplaying(!isReplaying)}
                                      style={{ backgroundColor: '#2E66E7', borderRadius: 16, padding: 6, marginRight: 8, marginLeft: 4 }}
                                    >
                                      <Ionicons name={isReplaying ? 'pause' : 'play'} size={16} color="#fff" />
                                    </TouchableOpacity>
                                    <Slider
                                      style={{ flex: 1, height: 24, marginRight: 0, marginLeft: 0 }}
                                      minimumValue={0}
                                      maximumValue={locations.length - 1}
                                      value={replayIndex}
                                      onValueChange={(val: number) => setReplayIndex(Math.round(val))}
                                      minimumTrackTintColor="#2E66E7"
                                      maximumTrackTintColor="#eaf0fa"
                                      thumbTintColor="#2E66E7"
                                    />
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
                                      <TouchableOpacity
                                        onPress={() => setReplaySpeed(prev => {
                                          const idx = REPLAY_SPEEDS.indexOf(prev);
                                          return REPLAY_SPEEDS[(idx + 1) % REPLAY_SPEEDS.length];
                                        })}
                                        style={{ backgroundColor: '#eee', borderRadius: 20, padding: 8, marginRight: 4 }}
                                      >
                                        <Text style={styles.speedBtn}>{replaySpeed}x</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        onPress={() => {
                                          setReplayIndex(0);
                                          setIsReplaying(false);
                                        }}
                                        accessibilityLabel="Restart log replay"
                                        style={{ backgroundColor: '#eaf0fa', borderRadius: 20, padding: 8, marginRight: 4, marginLeft: 4 }}
                                      >
                                        <Text style={styles.replayBtn}>⟲</Text>
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                </View>
                              )}
                              {/* Recenter button */}
                              {locations.length > 0 && (
                                <TouchableOpacity
                                  style={styles.recenterBtn}
                                  onPress={() => {
                                    if (locations.length > 0 && mapRef.current) {
                                      mapRef.current.animateToRegion({
                                        latitude: locations[replayIndex].latitude,
                                        longitude: locations[replayIndex].longitude,
                                        latitudeDelta: 0.01,
                                        longitudeDelta: 0.01,
                                      });
                                    }
                                  }}
                                  accessibilityLabel="Recenter on current log location"
                                >
                                  <Ionicons name="locate" size={22} color="#2E66E7" />
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        </ScrollView>
                        <View style={styles.buttonContainer}>
                          <TouchableOpacity onPress={() => handleSubmit()} style={[styles.saveButton, { backgroundColor: theme.primary }]}>
                            <Text style={styles.saveButtonText}>Save Trip</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setModalVisibility(false)} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </Formik>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "92%",
    height: "82%",
    borderRadius: 18,
    padding: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  innerContainer: {
    flex: 1,
    padding: 22,
    width: "100%",
    justifyContent: "flex-start",
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "500",
  },
  sectionCard: {
    backgroundColor: '#f7f9fc',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#2E66E7',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 10,
    color: "#2E66E7",
    marginTop: 0,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: "#fafbfc",
    color: "#222",
  },
  textArea: {
    minHeight: 80,
    maxHeight: 160,
    paddingTop: 12,
  },
  crewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
  deleteButtonText: {
    fontSize: 18,
    color: "#E74C3C",
  },
  errorText: {
    color: "#E74C3C",
    marginBottom: 10,
    textAlign: "center",
    fontSize: 14,
  },
  addButton: {
    marginBottom: 15,
    alignItems: "center",
  },
  addButtonText: {
    color: "#2E66E7",
    fontWeight: "bold",
    fontSize: 16,
  },
  map: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 0,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 10,
    marginBottom: 10,
  },
  saveButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 8,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginLeft: 8,
  },
  cancelText: {
    color: "#E74C3C",
    fontWeight: "bold",
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  recenterBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 7,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    zIndex: 20,
  },
  speedBtn: {
    color: '#2E66E7',
    fontWeight: 'bold',
    fontSize: 15,
  },
  replayBtn: {
    fontSize: 20,
    color: '#2E66E7',
    fontWeight: 'bold',
  },
});

export default SaveLogModal;
