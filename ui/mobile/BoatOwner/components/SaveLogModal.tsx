import React, { Dispatch, SetStateAction, useState } from "react";
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
import MapView, { Polyline } from "react-native-maps";
import { LocationPoint, SaveLogDTO } from "../interfaces/log/log";
import { useSaveLog } from "@/hooks/useSaveLog";

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
                <Text style={styles.modalTitle}>Trip Summary {new Date().toLocaleDateString()}</Text>

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
                        <TextInput
                          style={styles.input}
                          placeholder="Trip Description"
                          value={values.description}
                          onChangeText={handleChange("description")}
                          onBlur={handleBlur("description")}
                        />
                        {errors.description && touched.description && (
                          <Text style={styles.errorText}>Description cannot be empty.</Text>
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

                        <MapView
                          style={styles.map}
                          initialRegion={{
                            latitude: locations[0]?.latitude || 37.78825,
                            longitude: locations[0]?.longitude || -122.4324,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                          }}
                        >
                          <Polyline coordinates={locations} strokeWidth={4} strokeColor="blue" />
                        </MapView>
                      </ScrollView>

                      <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={() => handleSubmit()} style={styles.saveButton}>
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
    height: "80%", // Fixed height
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
  cancelButton: {
    marginTop: 10,
    alignItems: "center",
  },
  cancelText: {
    color: "red",
    fontWeight: "bold",
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
});

export default SaveLogModal;
