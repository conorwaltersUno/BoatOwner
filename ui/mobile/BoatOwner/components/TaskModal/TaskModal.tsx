import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { TaskModalProps } from "@/interfaces/todo/taskModal";

const TaskModal: React.FC<TaskModalProps> = ({ visible, onClose, onSubmit }) => {
  const validationSchema = Yup.object().shape({
    description: Yup.string().trim().required("Description is required."),
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add a New Task</Text>
              <Formik
                initialValues={{ description: "" }}
                validationSchema={validationSchema}
                onSubmit={(values, { resetForm }) => {
                  onSubmit(values.description, "pending");
                  resetForm();
                  onClose();
                }}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                  <>
                    <Text style={styles.inputLabel}>Task Description</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Enter task description"
                      value={values.description}
                      onChangeText={handleChange("description")}
                      onBlur={handleBlur("description")}
                      placeholderTextColor="#aaa"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                    {errors.description && touched.description && (
                      <Text style={styles.errorText}>{errors.description}</Text>
                    )}
                    <View style={styles.buttonRow}>
                      <TouchableOpacity style={styles.saveButton} onPress={() => handleSubmit()}>
                        <Text style={styles.saveButtonText}>Add Task</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </Formik>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(30, 40, 60, 0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E66E7",
    marginBottom: 18,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2E66E7",
    marginBottom: 4,
    marginLeft: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#fafbfc",
    color: "#222",
  },
  textArea: {
    minHeight: 80,
    maxHeight: 160,
    paddingTop: 12,
  },
  errorText: {
    color: "#E74C3C",
    marginBottom: 10,
    textAlign: "left",
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#2E66E7",
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
});

export default TaskModal;
