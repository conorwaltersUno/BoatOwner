import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CreateExpenseDTO } from "@/interfaces/expenses/expense";
import { ExpenseModalProps } from "@/interfaces/expenses/expenseModal";

const AddExpenseModal: React.FC<ExpenseModalProps> = ({ visible, onClose, onSubmit }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const validationSchema = Yup.object().shape({
    expense_type: Yup.string().trim().required("Expense type is required."),
    amount: Yup.number().required("Amount is required."),
    expense_date: Yup.date().required("Expense date is required."),
  });

  const handleDateChange = (event: any, selectedDate: Date | undefined, setFieldValue: any) => {
    if (event.type === "set" && selectedDate) {
      setFieldValue("expense_date", selectedDate);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add a New Expense</Text>

              <Formik
                initialValues={{ expense_type: "", amount: 0.0, expense_date: new Date() }}
                validationSchema={validationSchema}
                onSubmit={(values: CreateExpenseDTO, { resetForm }) => {
                  onSubmit(values);
                  resetForm();
                  onClose();
                }}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Expense Type"
                      value={values.expense_type}
                      onChangeText={handleChange("expense_type")}
                      onBlur={handleBlur("expense_type")}
                    />
                    {errors.expense_type && touched.expense_type && (
                      <Text style={styles.errorText}>{errors.expense_type}</Text>
                    )}

                    <TextInput
                      style={styles.input}
                      placeholder="Amount"
                      value={values.amount.toString()}
                      onChangeText={handleChange("amount")}
                      onBlur={handleBlur("amount")}
                      keyboardType="numeric"
                    />
                    {errors.amount && touched.amount && <Text style={styles.errorText}>{errors.amount}</Text>}

                    <TouchableOpacity onPress={() => setShowDatePicker(!showDatePicker)}>
                      <View pointerEvents="none">
                        <TextInput
                          style={styles.input}
                          placeholder="Expense Date (YYYY-MM-DD)"
                          value={values.expense_date ? values.expense_date.toISOString().split("T")[0] : ""}
                          editable={false}
                        />
                      </View>
                    </TouchableOpacity>
                    {errors.expense_date && touched.expense_date && (
                      <Text style={styles.errorText}>{errors.expense_date as string}</Text>
                    )}

                    {showDatePicker && (
                      <DateTimePicker
                        value={values.expense_date || new Date()}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "calendar"}
                        onChange={(e, date) => handleDateChange(e, date, setFieldValue)}
                      />
                    )}

                    <View style={styles.buttonContainer}>
                      <Button
                        title="Add Expense"
                        onPress={() => {
                          setShowDatePicker(false), handleSubmit();
                        }}
                        color="#4CAF50"
                      />
                      <TouchableOpacity
                        onPress={() => {
                          setShowDatePicker(false), onClose();
                        }}
                        style={styles.cancelButton}
                      >
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

export default AddExpenseModal;
