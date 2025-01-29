import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (description: string, status: string) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ visible, onClose, onSubmit }) => {
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleAddTask = () => {
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    setError("");
    onSubmit(description, "pending"); // Set default status as 'pending'
    setDescription("");
    onClose();
  };

  const handleClose = () => {
    setError("");
    setDescription("");
    onClose();
  };

  const handleOutsideTap = () => {
    setError("");
    setDescription("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={handleOutsideTap}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add a New Task</Text>

              <TextInput
                style={styles.input}
                placeholder="Description"
                value={description}
                onChangeText={(text) => setDescription(text)}
              />

              <View style={styles.buttonContainer}>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <Button title="Add Task" onPress={handleAddTask} color="#4CAF50" />
                <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#F7F7F9",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#000000",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 10,
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

export default TaskModal;
