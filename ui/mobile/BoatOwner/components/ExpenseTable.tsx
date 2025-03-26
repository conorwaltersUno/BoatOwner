import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { ExpenseDTO } from "../interfaces/expenses/expense";

interface ExpenseTableProps {
  expenses: ExpenseDTO[];
  selectedExpenseType: string;
}

const screenWidth = Dimensions.get("window").width;

const formatDate = (dateString: string) => {
  return dateString.split("T")[0];
};

const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, selectedExpenseType }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const handleEditButtonClick = () => {
    setModalVisible(!modalVisible);
  };

  const filteredExpenses = expenses.filter((expense) => expense.expense_type === selectedExpenseType);

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <Text style={styles.headerCell}>Date</Text>
      <Text style={styles.headerCell}>Amount</Text>
      <Text style={styles.headerCell}>Actions</Text>
    </View>
  );

  const renderExpenseRow = ({ item }: { item: ExpenseDTO }) => (
    <View style={styles.row}>
      <Text style={styles.dateCell}>{formatDate(item.expense_date)}</Text>
      <Text style={styles.amountCell}>${item.amount}</Text>
      <TouchableOpacity onPress={handleEditButtonClick}>
        <Text style={styles.editButton}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{selectedExpenseType}</Text>
      {renderHeader()}
      <FlatList
        data={filteredExpenses}
        renderItem={renderExpenseRow}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    width: screenWidth,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: screenWidth,
  },
  headerCell: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 10,
    width: screenWidth - 40,
  },
  dateCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
  },
  amountCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    marginRight: 60,
  },
  editButton: {
    color: "#007BFF",
    fontWeight: "bold",
    marginRight: 15,
  },
});

export default ExpenseTable;
