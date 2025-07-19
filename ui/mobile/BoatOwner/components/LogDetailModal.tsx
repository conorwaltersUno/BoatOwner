import React, { useEffect, useState, useRef } from "react";
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
  Alert,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { UpdateLogDTO } from "../interfaces/log/log";
import { useUpdateLog } from "@/hooks/useUpdateLog";
import dayjs from "dayjs";
import LogRouteMapWithReplay from "./LogRouteMapWithReplay";
import { LogDTO } from '../interfaces/log/log';
import MapView, { Polyline, Marker } from 'react-native-maps';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

interface LogDetailModalProps {
  modalVisibility: boolean;
  setModalVisibility: React.Dispatch<React.SetStateAction<boolean>>;
  log: LogDTO;
  onLogUpdated?: (updatedLog: LogDTO) => void;
}

const REPLAY_SPEEDS = [0.5, 1, 1.5, 2, 5, 10];

const LogDetailModal: React.FC<LogDetailModalProps> = ({ modalVisibility, setModalVisibility, log, onLogUpdated }) => {
  const { mutate: updateLog } = useUpdateLog();
  const [isEditing, setIsEditing] = useState(false);
  const [localLog, setLocalLog] = useState<LogDTO>(log);
  const [replayIndex, setReplayIndex] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    setLocalLog(log);
  }, [log]);

  useEffect(() => {
    setReplayIndex(0);
    setIsReplaying(false);
    setReplaySpeed(1);
  }, [log]);

  useEffect(() => {
    if (isReplaying && localLog?.coordinates?.length > 1) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const speedMs = 100 / replaySpeed;
      intervalRef.current = setInterval(() => {
        setReplayIndex(prev => {
          if (prev < localLog.coordinates.length - 1) {
            return prev + 1;
          } else {
            // Loop back to start
            return 0;
          }
        });
      }, speedMs);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isReplaying, replaySpeed, localLog]);

  const handleSliderChange = (val: number) => {
    setReplayIndex(Math.round(val));
    setIsReplaying(false);
  };

  const validationSchema = Yup.object().shape({
    description: Yup.string().trim().required("Description is required."),
    crewMembers: Yup.array().of(Yup.string().trim().required("Crew member name cannot be empty.")),
  });

  const handleUpdate = (values: { description: string; crewMembers: string[] }) => {
    const updatedLog: LogDTO = {
      ...localLog,
      description: values.description,
      crew_members: values.crewMembers,
    };

    updateLog(updatedLog, {
      onSuccess: () => {
        setIsEditing(false);
        setLocalLog(updatedLog);
        Alert.alert("Success", "Log updated successfully");
        if (onLogUpdated) onLogUpdated(updatedLog);
      },
      onError: (error) => {
        Alert.alert("Error", "Failed to update log");
        console.error(error);
      },
    });
  };

  useEffect(() => {
    if (!modalVisibility) setIsEditing(false);
  }, [modalVisibility]);

  function formatDuration(seconds: number) {
    if (isNaN(seconds) || seconds < 0) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h ? `${h}h` : "", m ? `${m}m` : "", `${s}s`].filter(Boolean).join(" ");
  }

  const getCurrentPointTime = () => {
    if (!localLog?.coordinates?.length || !localLog.log_started || isNaN(new Date(localLog.log_started).getTime()))
      return '0s';
    const currCoord = localLog.coordinates[replayIndex];
    if (currCoord?.timestamp) {
      const start = new Date(localLog.log_started).getTime();
      const curr = new Date(currCoord.timestamp).getTime();
      if (!isNaN(curr) && !isNaN(start)) {
        const elapsedSec = Math.max(0, Math.round((curr - start) / 1000));
        return formatDuration(elapsedSec);
      }
    }
    const totalPoints = localLog.coordinates.length;
    const totalDuration =
      localLog.log_started && localLog.log_ended
        ? new Date(localLog.log_ended).getTime() - new Date(localLog.log_started).getTime()
        : 0;
    if (totalPoints > 1 && totalDuration > 0) {
      const elapsedMs = Math.round((replayIndex / (totalPoints - 1)) * totalDuration);
      return formatDuration(Math.max(0, Math.round(elapsedMs / 1000)));
    }
    return '0s';
  };

  const getTotalDuration = () => {
    if (!localLog?.log_started || !localLog?.log_ended) return '0s';
    const start = new Date(localLog.log_started).getTime();
    const end = new Date(localLog.log_ended).getTime();
    if (isNaN(start) || isNaN(end) || end < start) return '0s';
    const elapsedSec = Math.round((end - start) / 1000);
    return formatDuration(elapsedSec);
  };

  const getCurrentPointTimestamp = () => {
    if (!localLog?.coordinates?.length) return '';
    const curr = localLog.coordinates[replayIndex]?.timestamp;
    if (curr) {
      const date = dayjs(curr);
      if (date.isValid()) {
        return date.format('YYYY-MM-DD HH:mm');
      }
    }
    return '';
  };

  const renderLogDetails = () => {
    if (!localLog) return null;

    return (
      <View style={styles.detailContainer}>
        <Text style={styles.detailTitle}>Trip Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Description:</Text>
          <Text style={styles.detailValue}>{localLog.description || ""}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Start Time:</Text>
          <Text style={styles.detailValue}>
            {localLog.log_started ? dayjs(localLog.log_started).format("YYYY-MM-DD HH:mm") : "N/A"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>End Time:</Text>
          <Text style={styles.detailValue}>
            {localLog.log_ended ? dayjs(localLog.log_ended).format("YYYY-MM-DD HH:mm") : "N/A"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created On:</Text>
          <Text style={styles.detailValue}>
            {localLog.created_on ? dayjs(localLog.created_on).format("YYYY-MM-DD HH:mm") : "N/A"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Duration:</Text>
          <Text style={styles.detailValue}>{getTotalDuration()}</Text>
        </View>
        <Text style={styles.detailLabelCrew}>Crew Members:</Text>
        <View style={styles.crewMembersHorizontal}>
          {localLog.crew_members.map((crew, index) => (
            <View key={index} style={styles.crewMemberRow}>
              <Text style={styles.crewMemberText}>{crew}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={modalVisibility} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={() => setModalVisibility(false)}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={100}
          style={{ flex: 1, width: "100%", justifyContent: 'center', alignItems: 'center' }}
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.dynamicModalContainer}>
              <View style={styles.innerContainer}>
                <View style={styles.headerRow}>
                  <Text style={styles.modalTitle}>{isEditing ? "Edit Log" : "Log Details"}</Text>
                  <TouchableOpacity onPress={() => setModalVisibility(false)} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                {/* Map + Replay UI */}
                <View style={styles.mapContainerDynamic}>
                  <View style={{ position: 'relative' }}>
                    <MapView
                      ref={mapRef}
                      style={{ width: '100%', height: 220, borderRadius: 12 }}
                      initialRegion={
                        localLog.coordinates?.[0]
                          ? {
                              latitude: localLog.coordinates[0].latitude,
                              longitude: localLog.coordinates[0].longitude,
                              latitudeDelta: 0.05,
                              longitudeDelta: 0.05,
                            }
                          : {
                              latitude: 37.78825,
                              longitude: -122.4324,
                              latitudeDelta: 0.05,
                              longitudeDelta: 0.05,
                            }
                      }
                      region={
                        localLog.coordinates?.[replayIndex]
                          ? {
                              latitude: localLog.coordinates[replayIndex].latitude,
                              longitude: localLog.coordinates[replayIndex].longitude,
                              latitudeDelta: 0.05,
                              longitudeDelta: 0.05,
                            }
                          : undefined
                      }
                      pointerEvents="none"
                    >
                      <Polyline
                        coordinates={localLog.coordinates.map(c => ({ latitude: c.latitude, longitude: c.longitude }))}
                        strokeColor="#007AFF"
                        strokeWidth={3}
                      />
                      {localLog.coordinates[replayIndex] && (
                        <Marker
                          coordinate={{
                            latitude: localLog.coordinates[replayIndex].latitude,
                            longitude: localLog.coordinates[replayIndex].longitude,
                          }}
                        />
                      )}
                    </MapView>
                    <TouchableOpacity
                      style={styles.recenterBtn}
                      onPress={() => {
                        if (mapRef.current && localLog.coordinates[replayIndex]) {
                          mapRef.current.animateToRegion({
                            latitude: localLog.coordinates[replayIndex].latitude,
                            longitude: localLog.coordinates[replayIndex].longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                          });
                        }
                      }}
                      accessibilityLabel="Recenter on current log location"
                    >
                      <Ionicons name="locate" size={22} color="#2E66E7" />
                    </TouchableOpacity>
                  </View>
                  {/* Slider and controls */}
                  <View style={styles.sliderRow}>
                    <TouchableOpacity onPress={() => setIsReplaying(!isReplaying)} style={{ backgroundColor: '#2E66E7', borderRadius: 16, padding: 6, marginRight: 8, marginLeft: 4 }}>
                      <Ionicons name={isReplaying ? 'pause' : 'play'} size={16} color="#fff" />
                    </TouchableOpacity>
                    <Slider
                      style={{ flex: 1, marginHorizontal: 12, height: 24 }}
                      minimumValue={0}
                      maximumValue={localLog.coordinates.length - 1}
                      value={replayIndex}
                      onValueChange={handleSliderChange}
                      step={1}
                      minimumTrackTintColor="#007AFF"
                      maximumTrackTintColor="#ccc"
                      thumbTintColor="#007AFF"
                    />
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
                      <TouchableOpacity onPress={() => setReplaySpeed(prev => {
                        const idx = REPLAY_SPEEDS.indexOf(prev);
                        return REPLAY_SPEEDS[(idx + 1) % REPLAY_SPEEDS.length];
                      })} style={{ backgroundColor: '#eee', borderRadius: 20, padding: 8, marginRight: 4 }}>
                          <Text style={styles.speedBtn}>{replaySpeed}x</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                          setReplayIndex(0);
                          setIsReplaying(false);
                        }} accessibilityLabel="Restart log replay" style={{ backgroundColor: '#eaf0fa', borderRadius: 20, padding: 8, marginRight: 4, marginLeft: 4 }}>
                          <Text style={styles.replayBtn}>⟲</Text>
                        </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.sliderInfoRow}>
                    <Text style={styles.sliderInfoText}>{getCurrentPointTime()} / {getTotalDuration()}</Text>
                    <Text style={styles.sliderInfoText}>{getCurrentPointTimestamp()}</Text>
                  </View>
                </View>
                {/* Details Section */}
                {renderLogDetails()}
                <Formik
                  initialValues={{
                    description: localLog?.description || "",
                    crewMembers: localLog?.crew_members || [""]
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleUpdate}
                  enableReinitialize
                >
                  {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                    <>
                      <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator
                      >
                        {!isEditing ? (
                          renderLogDetails()
                        ) : (
                          <>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <TextInput
                              style={styles.input}
                              placeholder="Trip Description"
                              value={values.description}
                              onChangeText={handleChange("description")}
                              onBlur={handleBlur("description")}
                              editable={isEditing}
                              placeholderTextColor="#aaa"
                            />
                            {errors.description && touched.description && (
                              <Text style={styles.errorText}>{errors.description}</Text>
                            )}

                            <Text style={styles.sectionTitle}>Crew Members</Text>
                            <View style={styles.crewMembersHorizontal}>
                              {values.crewMembers.map((member, idx) => (
                                <View key={idx} style={styles.crewRowHorizontal}>
                                  <TextInput
                                    style={[styles.input, styles.crewInputHorizontal]}
                                    placeholder={`Crew ${idx + 1}`}
                                    value={member}
                                    onChangeText={(text) => {
                                      const updated = [...values.crewMembers];
                                      updated[idx] = text;
                                      setFieldValue("crewMembers", updated);
                                    }}
                                    editable={isEditing}
                                    placeholderTextColor="#aaa"
                                  />
                                  {idx > 0 && isEditing && (
                                    <TouchableOpacity
                                      style={styles.deleteButtonHorizontal}
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
                                onPress={() => setFieldValue("crewMembers", [...values.crewMembers, ""])}
                                style={styles.addButtonHorizontal}
                              >
                                <Text style={styles.addButtonText}>+ Add</Text>
                              </TouchableOpacity>
                            </View>
                            {Array.isArray(errors.crewMembers) &&
                              errors.crewMembers.some((err) => err) &&
                              touched.crewMembers && (
                                <Text style={styles.errorText}>Crew member name cannot be empty.</Text>
                              )}
                          </>
                        )}
                      </ScrollView>
                      <View style={styles.buttonContainer}>
                        {!isEditing ? (
                          <View style={styles.actionRow}>
                            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
                              <Text style={styles.editButtonText}>Edit Log</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setModalVisibility(false)} style={styles.cancelButton}>
                              <Text style={styles.cancelText}>Close</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View style={styles.actionRow}>
                            <TouchableOpacity onPress={() => handleSubmit()} style={styles.saveButton}>
                              <Text style={styles.saveButtonText}>Save Changes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelButton}>
                              <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </>
                  )}
                </Formik>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(30, 40, 60, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  dynamicModalContainer: {
    width: '95%',
    height: '85%', // smaller modal height
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 0,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    alignSelf: 'center',
    flex: 0,
  },
  mapContainerDynamic: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 10, // less space below map before action bar
    backgroundColor: '#eaf0fa',
    alignSelf: 'center',
  },
  innerContainer: {
    flex: 1,
    padding: 16,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 8,
    paddingBottom: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E66E7',
    textAlign: 'left',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
  },
  closeButtonText: {
    fontSize: 22,
    color: '#2E66E7',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#2E66E7",
    marginTop: 18,
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
  crewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  crewMembersHorizontal: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  crewRowHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  crewMemberRow: {
    backgroundColor: "#eaf0fa",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  crewMemberText: {
    color: "#2E66E7",
    fontWeight: "600",
    fontSize: 15,
  },
  crewInputHorizontal: {
    minWidth: 90,
    maxWidth: 120,
    marginBottom: 0,
    marginRight: 4,
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
  deleteButtonHorizontal: {
    marginLeft: 2,
    padding: 4,
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
  addButtonHorizontal: {
    backgroundColor: "#eaf0fa",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  addButtonText: {
    color: "#2E66E7",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonContainer: {
    paddingTop: 10,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  detailContainer: {
    backgroundColor: "#f7f9fc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10, // reduced space below details
    marginTop: 8, // reduced space above details
    borderWidth: 1,
    borderColor: "#e3e8f0",
  },
  detailLabelCrew: {
    fontWeight: "600",
    marginRight: 10,
    marginBottom: 8,
    marginTop: 10,
    color: "#2E66E7",
    fontSize: 15,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "center",
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#2E66E7",
  },
  detailLabel: {
    fontWeight: "600",
    marginRight: 10,
    color: "#222",
    minWidth: 100,
  },
  detailValue: {
    color: "#444",
    flexShrink: 1,
  },
  editButton: {
    backgroundColor: "#2E66E7",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignItems: "center",
    marginRight: 8,
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignItems: "center",
    marginRight: 8,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignItems: "center",
  },
  cancelText: {
    color: "#E74C3C",
    fontWeight: "bold",
    fontSize: 16,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  replayBtn: {
    backgroundColor: '#2E66E7',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginLeft: 4,
  },
  speedBtn: {
    backgroundColor: '#eee',
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 15,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sliderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 2,
  },
  sliderInfoText: {
    color: '#888',
    fontSize: 13,
  },
  recenterBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
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
});

// Replay button styling should be handled inside LogRouteMapWithReplay or by targeting its children if needed.

export default LogDetailModal;
