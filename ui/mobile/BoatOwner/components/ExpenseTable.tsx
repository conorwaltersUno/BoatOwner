import React, { Dispatch, SetStateAction, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { ExpenseDTO } from "../interfaces/expenses/expense";
import EditExpenseModal from "./EditExpenseModal";

interface ExpenseTableProps {
  expenses: ExpenseDTO[];
  selectedExpenseType: string;
  setSelectedExpenseType: Dispatch<SetStateAction<string | null>>;
}

const screenWidth = Dimensions.get("window").width;

const formatDate = (dateString: string) => dateString.split("T")[0];

const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, selectedExpenseType, setSelectedExpenseType }) => {
  const [modalVisibility, setModalVisibility] = useState<boolean>(false);
  const [selectedExpenseForEdit, setselectedExpenseForEdit] = useState<ExpenseDTO | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  const handleEditButtonClick = (item: ExpenseDTO) => {
    setselectedExpenseForEdit(item);
    setModalVisibility(true);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const filteredExpenses = expenses.filter((expense) => expense.expense_type === selectedExpenseType);

  const sortedExpenses = sortOrder
    ? [...filteredExpenses].sort((a, b) => {
        const dateA = new Date(a.expense_date).getTime();
        const dateB = new Date(b.expense_date).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      })
    : filteredExpenses;

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <TouchableOpacity onPress={toggleSortOrder} style={styles.sortableHeaderCell}>
        <Text style={styles.headerCell}>Date {sortOrder === "asc" ? "↑" : sortOrder === "desc" ? "↓" : ""}</Text>
      </TouchableOpacity>
      <Text style={styles.headerCell}>Amount</Text>
      <Text style={styles.headerCell}>Actions</Text>
    </View>
  );

  const renderExpenseRow = ({ item }: { item: ExpenseDTO }) => (
    <View style={styles.row}>
      <Text style={styles.dateCell}>{formatDate(item.expense_date)}</Text>
      <Text style={styles.amountCell}>${item.amount}</Text>
      <TouchableOpacity onPress={() => handleEditButtonClick(item)}>
        <Text style={styles.editButton}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{selectedExpenseType}</Text>
      {renderHeader()}
      <FlatList data={sortedExpenses} renderItem={renderExpenseRow} keyExtractor={(item, index) => index.toString()} />
      <EditExpenseModal
        modalVisibility={modalVisibility}
        expense={selectedExpenseForEdit}
        setModalVisibility={setModalVisibility}
        setSelectedExpenseType={setSelectedExpenseType}
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
  sortableHeaderCell: {
    flex: 1,
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
