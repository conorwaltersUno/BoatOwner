import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  Modal,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { TaskModalProps } from "@/interfaces/todo/taskModal";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/ThemedText";

const TaskModal: React.FC<TaskModalProps> = ({ visible, onClose, onSubmit }) => {
  const { theme } = useTheme();

  const validationSchema = Yup.object().shape({
    description: Yup.string().trim().required("Description is required."),
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay || 'rgba(30,40,60,0.18)' }] }>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContainer, { backgroundColor: theme.background, borderColor: theme.border }] }>
              <ThemedText style={[styles.modalTitle, { color: theme.primary }]}>Add a New Task</ThemedText>
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
                    <ThemedText style={[styles.inputLabel, { color: theme.text }]}>Task Description</ThemedText>
                    <TextInput
                      style={[
                        styles.input,
                        styles.textArea,
                        { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
                      ]}
                      placeholder="Enter task description"
                      value={values.description}
                      onChangeText={handleChange("description")}
                      onBlur={handleBlur("description")}
                      placeholderTextColor={theme.text + '66'}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                    {errors.description && touched.description && (
                      <ThemedText style={[styles.errorText, { color: theme.error || '#E74C3C' }]}>{errors.description}</ThemedText>
                    )}
                    <View style={styles.buttonRow}>
                      <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={() => handleSubmit()}>
                        <ThemedText style={[styles.saveButtonText, { color: theme.background }]}>Add Task</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={onClose} style={[styles.cancelButton, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}> 
                        <ThemedText style={[styles.cancelText, { color: theme.error || '#E74C3C' }]}>Cancel</ThemedText>
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
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "88%",
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
    marginBottom: 18,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "500",
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
