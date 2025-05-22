import React, { useEffect, useState } from "react";
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
  Dimensions,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import MapView, { Polyline, Marker } from "react-native-maps";
import { UpdateLogDTO } from "../interfaces/log/log";
import { useUpdateLog } from "@/hooks/useUpdateLog";
import dayjs from "dayjs";

interface LogDetailModalProps {
  modalVisibility: boolean;
  setModalVisibility: React.Dispatch<React.SetStateAction<boolean>>;
  log: UpdateLogDTO;
  onLogUpdated?: (updatedLog: UpdateLogDTO) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const LogDetailModal: React.FC<LogDetailModalProps> = ({ modalVisibility, setModalVisibility, log, onLogUpdated }) => {
  const { mutate: updateLog } = useUpdateLog();
  const [isEditing, setIsEditing] = useState(false);
  const [localLog, setLocalLog] = useState<UpdateLogDTO>(log);
  const [replayIndex, setReplayIndex] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);

  useEffect(() => {
    setLocalLog(log);
  }, [log]);

  const validationSchema = Yup.object().shape({
    description: Yup.string().trim().required("Description is required."),
    crewMembers: Yup.array().of(Yup.string().trim().required("Crew member name cannot be empty.")),
  });

  const handleUpdate = (values: { description: string; crewMembers: string[] }) => {
    const updatedLog: UpdateLogDTO = {
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

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isReplaying && localLog?.coordinates?.length > 1) {
      interval = setInterval(() => {
        setReplayIndex((prev) => {
          if (prev < localLog.coordinates.length - 1) {
            return prev + 1;
          } else {
            setIsReplaying(false);
            return prev;
          }
        });
      }, 10);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReplaying, localLog]);

  useEffect(() => {
    setReplayIndex(0);
    setIsReplaying(false);
  }, [localLog, modalVisibility]);

  function formatDuration(seconds: number) {
    if (isNaN(seconds) || seconds < 0) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h ? `${h}h` : "", m ? `${m}m` : "", `${s}s`].filter(Boolean).join(" ");
  }

  const getCurrentPointTime = () => {
    if (!localLog?.coordinates?.length || !localLog.log_started || isNaN(new Date(localLog.log_started).getTime()))
      return "0s";

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

    return "0s";
  };

  const getTotalDuration = () => {
    if (!localLog?.log_started || !localLog?.log_ended) return "0s";
    const start = new Date(localLog.log_started).getTime();
    const end = new Date(localLog.log_ended).getTime();
    if (isNaN(start) || isNaN(end) || end < start) return "0s";
    const elapsedSec = Math.round((end - start) / 1000);
    return formatDuration(elapsedSec);
  };

  const getCurrentPointTimestamp = () => {
    if (!localLog?.coordinates?.length) return "";
    const curr = localLog.coordinates[replayIndex]?.timestamp;
    if (curr) {
      const date = dayjs(curr);
      if (date.isValid()) {
        return date.format("YYYY-MM-DD HH:mm");
      }
    }
    return "";
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
      <TouchableWithoutFeedback onPress={() => setModalVisibility(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              keyboardVerticalOffset={100}
              style={{ flex: 1, width: "100%" }}
            >
              <View style={styles.modalContainer}>
                <View style={styles.innerContainer}>
                  <View style={styles.headerRow}>
                    <Text style={styles.modalTitle}>{isEditing ? "Edit Log" : "Log Details"}</Text>
                    <TouchableOpacity onPress={() => setModalVisibility(false)} style={styles.closeButton}>
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <Formik
                    initialValues={{
                      description: localLog?.description || "",
                      crewMembers: localLog?.crew_members || [""],
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

                          <Text style={styles.sectionTitle}>Route Map</Text>
                          <View style={styles.mapContainer}>
                            <MapView
                              style={styles.map}
                              initialRegion={{
                                latitude: localLog?.coordinates[0]?.latitude || 37.78825,
                                longitude: localLog?.coordinates[0]?.longitude || -122.4324,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                              }}
                            >
                              <Polyline
                                coordinates={localLog?.coordinates || []}
                                strokeWidth={7}
                                strokeColor="#2E66E7"
                                lineCap="round"
                                lineJoin="round"
                                zIndex={10}
                              />
                              <Polyline
                                coordinates={localLog?.coordinates || []}
                                strokeWidth={11}
                                strokeColor="#fff"
                                lineCap="round"
                                lineJoin="round"
                                zIndex={5}
                              />
                              {localLog?.coordinates?.length > 0 && (
                                <Marker
                                  coordinate={localLog.coordinates[replayIndex]}
                                  pinColor="#E74C3C"
                                  title="Current Position"
                                  description={
                                    getCurrentPointTimestamp()
                                      ? `Time: ${getCurrentPointTimestamp()}`
                                      : `Elapsed: ${getCurrentPointTime()}`
                                  }
                                />
                              )}
                            </MapView>
                          </View>

                          <View style={styles.replayControls}>
                            {!isReplaying ? (
                              <TouchableOpacity
                                style={styles.replayButton}
                                onPress={() => {
                                  setReplayIndex(0);
                                  setIsReplaying(true);
                                }}
                                disabled={!localLog?.coordinates?.length}
                              >
                                <Text style={styles.replayButtonText}>Replay Trip</Text>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity
                                style={[styles.replayButton, styles.replayButtonActive]}
                                onPress={() => {
                                  setIsReplaying(false);
                                }}
                              >
                                <Text style={styles.replayButtonText}>Stop Replay</Text>
                              </TouchableOpacity>
                            )}
                            {isReplaying && (
                              <Text style={styles.replayProgress}>
                                Elapsed: {getCurrentPointTime()} / {getTotalDuration()}
                                {getCurrentPointTimestamp() ? ` (${getCurrentPointTimestamp()})` : ""}
                              </Text>
                            )}
                          </View>
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
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const MODAL_WIDTH = 420;
const MODAL_HEIGHT = 825;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(30, 40, 60, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: MODAL_WIDTH,
    height: MODAL_HEIGHT,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 0,
    marginTop: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
  innerContainer: {
    flex: 1,
    padding: SCREEN_WIDTH > 400 ? 24 : 12,
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SCREEN_HEIGHT > 700 ? 16 : 8,
  },
  closeButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
  },
  closeButtonText: {
    fontSize: 20,
    color: "#2E66E7",
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: SCREEN_WIDTH > 400 ? 24 : 18,
    fontWeight: "bold",
    color: "#2E66E7",
    textAlign: "left",
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SCREEN_HEIGHT > 700 ? 30 : 16,
  },
  sectionTitle: {
    fontSize: SCREEN_WIDTH > 400 ? 17 : 15,
    fontWeight: "600",
    marginBottom: 10,
    color: "#2E66E7",
    marginTop: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: SCREEN_WIDTH > 400 ? 12 : 8,
    fontSize: SCREEN_WIDTH > 400 ? 16 : 14,
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
  mapContainer: {
    flex: 1,
    minHeight: SCREEN_HEIGHT > 700 ? 250 : 200,
    maxHeight: SCREEN_HEIGHT > 700 ? 350 : 260,
    marginTop: 10,
    marginBottom: 10,
  },
  map: {
    flex: 1,
    borderRadius: 10,
    minHeight: SCREEN_HEIGHT > 700 ? 220 : 140,
    maxHeight: SCREEN_HEIGHT > 700 ? 350 : 200,
    width: "100%",
  },
  buttonContainer: {
    paddingTop: 10,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  detailContainer: {
    backgroundColor: "#f7f9fc",
    borderRadius: 12,
    padding: SCREEN_WIDTH > 400 ? 16 : 10,
    marginBottom: 15,
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
    fontSize: SCREEN_WIDTH > 400 ? 18 : 15,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#2E66E7",
  },
  detailLabel: {
    fontWeight: "600",
    marginRight: 10,
    color: "#222",
    minWidth: SCREEN_WIDTH > 400 ? 100 : 70,
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
  replayControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  replayButton: {
    backgroundColor: "#2E66E7",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  replayButtonActive: {
    backgroundColor: "#aaa",
  },
  replayButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  replayProgress: {
    marginLeft: 12,
    color: "#2E66E7",
    fontWeight: "600",
    fontSize: SCREEN_WIDTH > 400 ? 15 : 13,
  },
});

export default LogDetailModal;
