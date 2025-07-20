import React, { useState } from "react";
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
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CreateExpenseDTO } from "@/interfaces/expenses/expense";
import { ExpenseModalProps } from "@/interfaces/expenses/expenseModal";
import { useTheme } from "@/context/ThemeContext";

const AddExpenseModal: React.FC<ExpenseModalProps & { testID?: string }> = ({ visible, onClose, onSubmit, testID }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { theme, isDark } = useTheme();

  const validationSchema = Yup.object().shape({
    expense_type: Yup.string().trim().required("Expense type is required."),
    amount: Yup.number().required("Amount is required."),
    expense_date: Yup.date().required("Expense date is required."),
  });

  const handleDateChange = (event: any, selectedDate: Date | undefined, setFieldValue: any) => {
    if (event.type === "set" && selectedDate) {
      setFieldValue("expense_date", selectedDate);
      setShowDatePicker(false);
    } else if (event.type === "dismissed") {
      setShowDatePicker(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" testID={testID}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContainer, { backgroundColor: theme.card, shadowColor: theme.text }] }>
              <Text style={[styles.modalTitle, { color: theme.primary }]}>Add a New Expense</Text>
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
                    <Text style={[styles.inputLabel, { color: theme.primary }]}>Expense Type</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                      placeholder="Expense Type"
                      placeholderTextColor={theme.text + '66'}
                      value={values.expense_type}
                      onChangeText={handleChange("expense_type")}
                      onBlur={handleBlur("expense_type")}
                    />
                    {errors.expense_type && touched.expense_type && (
                      <Text style={[styles.errorText, { color: '#E74C3C' }]}>{errors.expense_type}</Text>
                    )}

                    <Text style={[styles.inputLabel, { color: theme.primary }]}>Amount</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                      placeholder="Amount"
                      placeholderTextColor={theme.text + '66'}
                      value={values.amount ? values.amount.toString() : ""}
                      onChangeText={handleChange("amount")}
                      onBlur={handleBlur("amount")}
                      keyboardType="numeric"
                    />
                    {errors.amount && touched.amount && <Text style={[styles.errorText, { color: '#E74C3C' }]}>{errors.amount}</Text>}

                    <Text style={[styles.inputLabel, { color: theme.primary }]}>Expense Date</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker((prev) => !prev)}>
                      <View pointerEvents="none">
                        <TextInput
                          style={[
                            styles.input,
                            { backgroundColor: theme.background, color: isDark ? '#fff' : '#222', borderColor: theme.border }
                          ]}
                          placeholder="Expense Date (YYYY-MM-DD)"
                          placeholderTextColor={theme.text + '66'}
                          value={values.expense_date ? values.expense_date.toISOString().split("T")[0] : ""}
                          editable={false}
                        />
                      </View>
                    </TouchableOpacity>
                    {errors.expense_date && touched.expense_date && (
                      <Text style={[styles.errorText, { color: '#E74C3C' }]}>{errors.expense_date as string}</Text>
                    )}

                    {showDatePicker && (
                      <View style={{ backgroundColor: isDark ? '#222' : '#fff', borderRadius: 12, marginBottom: 12 }}>
                        <DateTimePicker
                          value={values.expense_date || new Date()}
                          mode="date"
                          display={Platform.OS === "ios" ? "spinner" : "calendar"}
                          onChange={(e, date) => handleDateChange(e, date, setFieldValue)}
                          textColor={isDark ? '#fff' : '#222'}
                          themeVariant={isDark ? 'dark' : 'light'}
                        />
                      </View>
                    )}

                    <View style={styles.buttonRow}>
                      <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={() => handleSubmit()}>
                        <Text style={styles.saveButtonText}>Add Expense</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.cancelButton, { backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }]}
                        onPress={() => {
                          setShowDatePicker(false);
                          onClose();
                        }}
                      >
                        <Text style={[styles.cancelText, { color: '#E74C3C' }]}>Cancel</Text>
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
    width: "92%",
    borderRadius: 16,
    padding: 22,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    maxHeight: "80%",
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
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  errorText: {
    marginBottom: 10,
    textAlign: "left",
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
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
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AddExpenseModal;
