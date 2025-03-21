import React, { useState } from "react";
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { ExpenseDTO } from "../interfaces/expenses/expense";

interface ExpenseTableProps {
  expenses: ExpenseDTO[];
  selectedExpenseType: string;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, selectedExpenseType }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false); // State to manage modal visibility

  const handleEditButtonClick = () => {
    setModalVisible(!modalVisible); // Toggle the modal visibility
  };

  // Filter expenses based on the selected expense type
  const filteredExpenses = expenses.filter((expense) => expense.expense_type === selectedExpenseType);

  // Render each expense in a table row
  const renderExpenseRow = ({ item }: { item: ExpenseDTO }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.expense_date}</Text>
      <Text style={styles.cell}>${item.amount}</Text>
      <TouchableOpacity onPress={handleEditButtonClick}>
        <Text style={styles.editButton}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expenses - {selectedExpenseType}</Text>

      {/* Expense Table */}
      <FlatList
        data={filteredExpenses}
        renderItem={renderExpenseRow}
        keyExtractor={(item, index) => index.toString()}
        style={styles.table}
      />

      {/* Modal visibility status (for testing purposes) */}
      <Text style={styles.modalStatus}>Modal Visible: {modalVisible ? "Yes" : "No"}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  table: {
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cell: {
    fontSize: 16,
    flex: 1,
  },
  editButton: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  modalStatus: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
  },
});

export default ExpenseTable;
