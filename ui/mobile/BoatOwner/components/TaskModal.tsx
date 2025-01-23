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
  Alert,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (description: string, status: string) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ visible, onClose, onSubmit }) => {
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false); // Track dropdown state

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "inProgress" },
  ];

  const handleAddTask = () => {
    if (!description.trim() || !status.trim()) {
      setError("Both fields are required.");
      return;
    }
    setError("");
    onSubmit(description, status);
    setDescription("");
    setStatus("");
    onClose();
  };

  const handleClose = () => {
    setError("");
    setDescription("");
    setStatus("");
    onClose();
  };

  const handleOutsideTap = () => {
    // Close the modal when tapping outside the modal content
    setError("");
    setDescription("");
    setStatus("");
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

              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                data={statusOptions}
                labelField="label"
                valueField="value"
                placeholder="Select Status"
                value={status}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => setDropdownOpen(false)}
                onChange={(item) => setStatus(item.value)}
              />

              <View style={dropdownOpen ? styles.buttonContainerExpandedDropDown : styles.buttonContainer}>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: "60%",
  },
  expandedModalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    flexDirection: "column",
    height: "50%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  errorText: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 10,
  },
  buttonContainerExpandedDropDown: {
    marginTop: 150,
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
