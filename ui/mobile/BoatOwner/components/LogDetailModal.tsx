import React, { useState } from "react";
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
import MapView, { Polyline } from "react-native-maps";
import { UpdateLogDTO } from "../interfaces/log/log";
import { useUpdateLog } from "@/hooks/useUpdateLog";
import { getLineSegmentsDueToNoExtrapolation } from "gifted-charts-core/dist/utils";

interface LogDetailModalProps {
  modalVisibility: boolean;
  setModalVisibility: React.Dispatch<React.SetStateAction<boolean>>;
  log: UpdateLogDTO;
}

const LogDetailModal: React.FC<LogDetailModalProps> = ({ modalVisibility, setModalVisibility, log }) => {
  const { mutate: updateLog } = useUpdateLog();
  const [isEditing, setIsEditing] = useState(false);

  const validationSchema = Yup.object().shape({
    description: Yup.string().trim().required("Description is required."),
    crewMembers: Yup.array().of(Yup.string().trim().required("Crew member name cannot be empty.")),
  });

  const handleUpdate = (values: { description: string; crewMembers: string[] }) => {
    const updatedLog: UpdateLogDTO = {
      ...log,
      description: values.description,
      crew_members: values.crewMembers,
    };

    updateLog(updatedLog, {
      onSuccess: () => {
        setIsEditing(false);
        Alert.alert("Success", "Log updated successfully");
      },
      onError: (error) => {
        Alert.alert("Error", "Failed to update log");
        console.error(error);
      },
    });
  };

  const renderLogDetails = () => {
    if (!log) return null;

    return (
      <View style={styles.detailContainer}>
        <Text style={styles.detailTitle}>Trip Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Description:</Text>
          <Text>{log.description ? log.description : ""}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Start Time:</Text>
          <Text>{log.log_started ? new Date(log.log_started).toLocaleString() : "N/A"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>End Time:</Text>
          <Text>{log.log_ended ? new Date(log.log_ended).toLocaleString() : "N/A"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created On:</Text>
          <Text>{log.created_on ? new Date(log.created_on).toLocaleString() : "N/A"}</Text>
        </View>
        <Text style={styles.detailLabelCrew}>Crew Members:</Text>
        {log.crew_members.map((crew, index) => (
          <View key={index} style={styles.detailRow}>
            <Text>{crew}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Modal visible={modalVisibility} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={() => setModalVisibility(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              keyboardVerticalOffset={100}
              style={styles.modalContainer}
            >
              <View style={styles.innerContainer}>
                <Text style={styles.modalTitle}>{isEditing ? "Edit Log" : "Log Details"}</Text>

                <Formik
                  initialValues={{
                    description: log?.description || "",
                    crewMembers: log?.crew_members || [""],
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleUpdate}
                  enableReinitialize
                >
                  {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                    <>
                      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                        {!isEditing && renderLogDetails()}

                        {isEditing && (
                          <>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <TextInput
                              style={styles.input}
                              placeholder="Trip Description"
                              value={values.description}
                              onChangeText={handleChange("description")}
                              onBlur={handleBlur("description")}
                              editable={isEditing}
                            />
                            {errors.description && touched.description && (
                              <Text style={styles.errorText}>{errors.description}</Text>
                            )}

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
                                  editable={isEditing}
                                />
                                {idx > 0 && isEditing && (
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

                            {isEditing && (
                              <TouchableOpacity
                                onPress={() => {
                                  setFieldValue("crewMembers", [...values.crewMembers, ""]);
                                }}
                                style={styles.addButton}
                              >
                                <Text style={styles.addButtonText}>+ Add Crew Member</Text>
                              </TouchableOpacity>
                            )}

                            {Array.isArray(errors.crewMembers) &&
                              errors.crewMembers.some((err) => err) &&
                              touched.crewMembers && (
                                <Text style={styles.errorText}>Crew member name cannot be empty.</Text>
                              )}
                          </>
                        )}

                        <MapView
                          style={styles.map}
                          initialRegion={{
                            latitude: log?.coordinates[0]?.latitude || 37.78825,
                            longitude: log?.coordinates[0]?.longitude || -122.4324,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                          }}
                        >
                          <Polyline coordinates={log?.coordinates || []} strokeWidth={4} strokeColor="blue" />
                        </MapView>
                      </ScrollView>

                      <View style={styles.buttonContainer}>
                        {!isEditing ? (
                          <View>
                            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
                              <Text style={styles.editButtonText}>Edit Log</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setModalVisibility(false)} style={styles.cancelButton}>
                              <Text style={styles.cancelText}>Close</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <>
                            <TouchableOpacity onPress={() => handleSubmit()} style={styles.saveButton}>
                              <Text style={styles.saveButtonText}>Save Changes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelButton}>
                              <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </>
                  )}
                </Formik>
              </View>
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
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    height: "90%",
    backgroundColor: "#F7F7F9",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#000",
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  innerContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
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
    color: "red",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  addButton: {
    marginBottom: 15,
    alignItems: "center",
  },
  addButtonText: {
    color: "#007BFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonContainer: {
    paddingTop: 10,
    marginBottom: 10,
  },
  detailContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  detailLabelCrew: {
    fontWeight: "600",
    marginRight: 10,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: "600",
    marginRight: 10,
  },
  editButton: {
    backgroundColor: "#007BFF",
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
    alignItems: "center",
  },
  cancelText: {
    color: "red",
    fontWeight: "bold",
  },
});

export default LogDetailModal;
