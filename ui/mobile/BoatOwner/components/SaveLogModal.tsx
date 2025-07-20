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

  const [step, setStep] = React.useState(0); // 0: Description, 1: Crew, 2: Map
  const [localError, setLocalError] = React.useState<string | null>(null);

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
    setStep(0);
  };

  // --- Route Replay State (copied and adapted from LogRouteMapWithReplay) ---
  const REPLAY_SPEEDS = [0.5, 1, 1.5, 2, 5, 10, 20, 50];
  const [replayIndex, setReplayIndex] = React.useState(0);
  const [isReplaying, setIsReplaying] = React.useState(false);
  const [replaySpeed, setReplaySpeed] = React.useState(1);
  const [replayProgress, setReplayProgress] = React.useState(0); // floating point progress
  const [isFollowing, setIsFollowing] = React.useState(true);
  const [mapRegion, setMapRegion] = React.useState<any>(undefined);
  const mapRef = React.useRef<MapView | null>(null);

  React.useEffect(() => {
    setReplayIndex(0);
    setReplayProgress(0);
    setIsReplaying(false);
    setReplaySpeed(1);
    setIsFollowing(true);
  }, [locations]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const TICK_MS = 4;
    if (isReplaying && locations.length > 1) {
      interval = setInterval(() => {
        setReplayProgress((prev) => {
          const next = prev + replaySpeed * (TICK_MS / 1000);
          if (next >= locations.length - 1) {
            setIsReplaying(false);
            return 0;
          }
          return next;
        });
      }, TICK_MS);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReplaying, locations, replaySpeed]);

  // Interpolated pin position for smoother following at high speeds
  const getInterpolatedCoord = () => {
    if (!locations.length) return null;
    const idx = Math.floor(replayProgress);
    const frac = replayProgress - idx;
    const curr = locations[idx];
    const next = locations[idx + 1] || curr;
    if (replaySpeed > 10 && next && curr) {
      return {
        latitude: curr.latitude + (next.latitude - curr.latitude) * frac,
        longitude: curr.longitude + (next.longitude - curr.longitude) * frac,
      };
    }
    return curr;
  };

  // Keep replayIndex in sync with replayProgress
  React.useEffect(() => {
    if (locations.length > 1) {
      const idx = Math.floor(replayProgress);
      setReplayIndex(Math.min(idx, locations.length - 1));
    }
  }, [replayProgress, locations]);

  // When user drags slider, update both replayIndex and replayProgress
  const handleSliderChange = (val: number) => {
    setReplayIndex(val);
    setReplayProgress(val);
    setIsReplaying(false);
  };

  // When replay starts, follow pin
  React.useEffect(() => {
    if (isReplaying) setIsFollowing(true);
  }, [isReplaying]);

  // Follow pin as replayIndex changes, unless user has panned/zoomed
  React.useEffect(() => {
    if (
      isFollowing &&
      locations.length > 0 &&
      mapRef.current
    ) {
      const interp = getInterpolatedCoord();
      if (interp) {
        mapRef.current.animateToRegion({
          latitude: interp.latitude,
          longitude: interp.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, replaySpeed > 10 ? 80 : 350);
      }
    }
  }, [replayIndex, replayProgress, isFollowing, locations, replaySpeed]);

  return (
    <Modal visible={modalVisibility} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={() => { setModalVisibility(false); setStep(0); }}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }] }>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              keyboardVerticalOffset={100}
              style={[
                styles.modalContainer,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  width: '98%',
                  maxWidth: 540,
                  height: '60%',
                  borderRadius: 20,
                  padding: 0,
                },
              ]}
            >
              <Formik
                initialValues={{ description: "", crewMembers: [""] }}
                validationSchema={validationSchema}
                onSubmit={(values, { resetForm }) => { handleSave(values); resetForm(); }}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                  <View style={styles.innerContainer}>
                    <ThemedText style={[styles.modalTitle, { color: theme.primary }]} accessibilityRole="header">Save Trip</ThemedText>
                    <ThemedText style={[styles.dateText, { color: theme.text + '99' }]}>{new Date().toLocaleDateString()}</ThemedText>
                    {/* Stepper indicator */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 18 }}>
                      {[0,1,2].map((s) => (
                        <View key={s} style={{ width: 18, height: 6, borderRadius: 3, marginHorizontal: 4, backgroundColor: step === s ? theme.primary : theme.border }} />
                      ))}
                    </View>
                    {/* Step 0: Description */}
                    {step === 0 && (
                      <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }] }>
                        <ThemedText style={[styles.sectionTitle, { color: theme.primary }]}>Description</ThemedText>
                        <TextInput
                          style={[
                            styles.input,
                            styles.textArea,
                            { backgroundColor: theme.input, color: theme.text, borderColor: theme.border },
                          ]}
                          placeholder="Describe your trip..."
                          placeholderTextColor={theme.placeholder}
                          value={values.description}
                          onChangeText={text => {
                            handleChange("description")(text);
                            setLocalError(null);
                          }}
                          onBlur={handleBlur("description")}
                          multiline
                          numberOfLines={4}
                          textAlignVertical="top"
                        />
                        {(localError && step === 0) && (
                          <ThemedText style={styles.errorText}>{localError}</ThemedText>
                        )}
                        {errors.description && touched.description && !localError && (
                          <ThemedText style={styles.errorText}>Description cannot be empty.</ThemedText>
                        )}
                        <View style={styles.buttonContainer}>
                          <TouchableOpacity
                            onPress={() => {
                              if (!values.description.trim()) {
                                setLocalError('Description cannot be empty.');
                                return;
                              }
                              setLocalError(null);
                              setStep(1);
                            }}
                            style={[styles.saveButton, { backgroundColor: theme.primary }]}
                          >
                            <ThemedText style={styles.saveButtonText}>Next</ThemedText>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => { setModalVisibility(false); setStep(0); setLocalError(null); }} style={[styles.cancelButton, { backgroundColor: theme.card, borderColor: theme.border }] }>
                            <ThemedText style={[styles.cancelText, { color: theme.error }]}>Cancel</ThemedText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    {/* Step 1: Crew Members */}
                    {step === 1 && (
                      <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }] }>
                        <ThemedText style={[styles.sectionTitle, { color: theme.primary }]}>Crew Members</ThemedText>
                        <ScrollView style={{ maxHeight: 180 }} contentContainerStyle={{ paddingBottom: 4 }}>
                          {values.crewMembers.map((member, idx) => (
                            <View key={idx} style={styles.crewRow}>
                              <TextInput
                                style={[
                                  styles.input,
                                  { flex: 1, backgroundColor: theme.input, color: theme.text, borderColor: theme.border },
                                ]}
                                placeholder={`Crew Member ${idx + 1}`}
                                placeholderTextColor={theme.placeholder}
                                value={member}
                                onChangeText={text => {
                                  const updated = [...values.crewMembers];
                                  updated[idx] = text;
                                  setFieldValue("crewMembers", updated);
                                  setLocalError(null);
                                }}
                              />
                              {idx > 0 && (
                                <TouchableOpacity
                                  style={styles.deleteButton}
                                  onPress={() => {
                                    const updated = values.crewMembers.filter((_, i) => i !== idx);
                                    setFieldValue("crewMembers", updated);
                                    setLocalError(null);
                                  }}
                                >
                                  <ThemedText style={styles.deleteButtonText}>🗑️</ThemedText>
                                </TouchableOpacity>
                              )}
                            </View>
                          ))}
                        </ScrollView>
                        <TouchableOpacity
                          onPress={() => {
                            setFieldValue("crewMembers", [...values.crewMembers, ""]);
                            setLocalError(null);
                          }}
                          style={styles.addButton}
                        >
                          <ThemedText style={styles.addButtonText}>+ Add Crew Member</ThemedText>
                        </TouchableOpacity>
                        {(localError && step === 1) && (
                          <ThemedText style={styles.errorText}>{localError}</ThemedText>
                        )}
                        {Array.isArray(errors.crewMembers) && errors.crewMembers.some((err) => err) && touched.crewMembers && !localError && (
                          <ThemedText style={styles.errorText}>Crew member name cannot be empty.</ThemedText>
                        )}
                        <View style={styles.buttonContainer}>
                          <TouchableOpacity onPress={() => { setStep(0); setLocalError(null); }} style={[styles.cancelButton, { backgroundColor: theme.card, borderColor: theme.border }] }>
                            <ThemedText style={[styles.cancelText, { color: theme.error }]}>Back</ThemedText>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              if (values.crewMembers.some((m) => !m.trim())) {
                                setLocalError('Crew member name cannot be empty.');
                                return;
                              }
                              setLocalError(null);
                              setStep(2);
                            }}
                            style={[styles.saveButton, { backgroundColor: theme.primary }]}
                          >
                            <ThemedText style={styles.saveButtonText}>Next</ThemedText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    {/* Step 2: Route Map */}
                    {step === 2 && (
                      <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }] }>
                        <ThemedText style={[styles.sectionTitle, { color: theme.primary }]}>Route Map</ThemedText>
                        <View style={{ marginBottom: 16 }}>
                          <MapView
                            ref={mapRef}
                            style={[styles.map, { borderColor: theme.border }]}
                            initialRegion={{
                              latitude: locations[0]?.latitude || 37.78825,
                              longitude: locations[0]?.longitude || -122.4324,
                              latitudeDelta: 0.01,
                              longitudeDelta: 0.01,
                            }}
                            region={mapRegion}
                            onRegionChangeComplete={region => setMapRegion(region)}
                            onPanDrag={() => setIsFollowing(false)}
                            onTouchStart={() => setIsFollowing(false)}
                          >
                            <Polyline coordinates={locations} strokeWidth={4} strokeColor={theme.primary} />
                            {locations.length > 0 && (
                              <Marker
                                coordinate={getInterpolatedCoord() || locations[replayIndex]}
                                pinColor={theme.error}
                                title="Current Position"
                              />
                            )}
                          </MapView>
                          {/* Replay Controls */}
                          {locations.length > 1 && (
                            <View style={{ marginTop: 10 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity
                                  onPress={() => setIsReplaying(!isReplaying)}
                                  style={{ backgroundColor: theme.primary, borderRadius: 16, padding: 6, marginRight: 8, marginLeft: 4 }}
                                >
                                  <Ionicons name={isReplaying ? 'pause' : 'play'} size={16} color={theme.buttonText} />
                                </TouchableOpacity>
                                <Slider
                                  style={{ flex: 1, height: 24, marginRight: 0, marginLeft: 0 }}
                                  minimumValue={0}
                                  maximumValue={locations.length - 1}
                                  value={replayIndex}
                                  onValueChange={handleSliderChange}
                                  minimumTrackTintColor={theme.primary}
                                  maximumTrackTintColor={theme.cardSecondary}
                                  thumbTintColor={theme.primary}
                                />
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
                                  <TouchableOpacity
                                    onPress={() => {
                                      const idx = REPLAY_SPEEDS.indexOf(replaySpeed);
                                      setReplaySpeed(REPLAY_SPEEDS[(idx + 1) % REPLAY_SPEEDS.length]);
                                    }}
                                    style={{ backgroundColor: theme.input, borderRadius: 20, padding: 8, marginRight: 4 }}
                                  >
                                    <ThemedText style={[styles.speedBtn, { color: theme.primary }]}>{replaySpeed}x</ThemedText>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() => {
                                      setReplayIndex(0);
                                      setReplayProgress(0);
                                      setIsReplaying(false);
                                    }}
                                    accessibilityLabel="Restart log replay"
                                    style={{ backgroundColor: theme.cardSecondary, borderRadius: 20, padding: 8, marginRight: 4, marginLeft: 4 }}
                                  >
                                    <ThemedText style={[styles.replayBtn, { color: theme.primary }]}>⟲</ThemedText>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </View>
                          )}
                          {/* Recenter button */}
                          {locations.length > 0 && (
                            <TouchableOpacity
                              style={[styles.recenterBtn, { backgroundColor: theme.input, borderColor: theme.border }]}
                              onPress={() => {
                                if (locations.length > 0 && mapRef.current) {
                                  const interp = getInterpolatedCoord();
                                  mapRef.current.animateToRegion({
                                    latitude: interp ? interp.latitude : locations[replayIndex].latitude,
                                    longitude: interp ? interp.longitude : locations[replayIndex].longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                  });
                                }
                              }}
                              accessibilityLabel="Recenter on current log location"
                            >
                              <Ionicons name="locate" size={22} color={theme.primary} />
                            </TouchableOpacity>
                          )}
                        </View>
                        <View style={styles.buttonContainer}>
                          <TouchableOpacity onPress={() => setStep(1)} style={[styles.cancelButton, { backgroundColor: theme.card, borderColor: theme.border }] }>
                            <ThemedText style={[styles.cancelText, { color: theme.error }]}>Back</ThemedText>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleSubmit()} style={[styles.saveButton, { backgroundColor: theme.primary }]}> 
                            <ThemedText style={styles.saveButtonText}>Save Trip</ThemedText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </Formik>
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
    width: "98%",
    height: "60%",
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
    minHeight: 170,
    maxHeight: 250,
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
