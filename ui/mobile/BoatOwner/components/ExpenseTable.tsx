import React, { Dispatch, SetStateAction, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { ExpenseDTO } from "../interfaces/expenses/expense";
import EditExpenseModal from "./EditExpenseModal";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface ExpenseTableProps {
  expenses: ExpenseDTO[];
  selectedExpenseType: string;
  setSelectedExpenseType: Dispatch<SetStateAction<string | null>>;
}

const screenWidth = Dimensions.get("window").width;

const formatDate = (dateString: string) => dateString.split("T")[0];

const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, selectedExpenseType, setSelectedExpenseType }) => {
  const { theme } = useTheme();
  const [modalVisibility, setModalVisibility] = useState<boolean>(false);
  const [selectedExpenseForEdit, setselectedExpenseForEdit] = useState<ExpenseDTO | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: "expense_date" | "amount"; order: "asc" | "desc" } | null>(null);

  const handleEditButtonClick = (item: ExpenseDTO) => {
    setselectedExpenseForEdit(item);
    setModalVisibility(true);
  };

  const toggleSortOrder = (key: "expense_date" | "amount") => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, order: prev.order === "asc" ? "desc" : "asc" };
      }
      return { key, order: "asc" };
    });
  };

  const filteredExpenses = expenses.filter((expense) => expense.expense_type === selectedExpenseType);

  const sortedExpenses = sortConfig
    ? [...filteredExpenses].sort((a, b) => {
        const valueA = sortConfig.key === "expense_date" ? new Date(a.expense_date).getTime() : a.amount;
        const valueB = sortConfig.key === "expense_date" ? new Date(b.expense_date).getTime() : b.amount;
        return sortConfig.order === "asc" ? valueA - valueB : valueB - valueA;
      })
    : filteredExpenses;

  const renderHeader = () => (
    <View style={[styles.headerRow, { backgroundColor: theme.card, borderBottomColor: theme.border }] }>
      <TouchableOpacity onPress={() => toggleSortOrder("expense_date")} style={styles.sortableHeaderCell}>
        <Text style={[styles.headerCell, { color: theme.text }]}>Date</Text>
        <MaterialIcons
          name={
            sortConfig?.key === "expense_date"
              ? sortConfig.order === "asc"
                ? "arrow-upward"
                : "arrow-downward"
              : "swap-vert"
          }
          size={20}
          color={theme.text}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => toggleSortOrder("amount")} style={styles.sortableHeaderCell}>
        <Text style={[styles.headerCell, { color: theme.text }]}>Amount</Text>
        <MaterialIcons
          name={
            sortConfig?.key === "amount"
              ? sortConfig.order === "asc"
                ? "arrow-upward"
                : "arrow-downward"
              : "swap-vert"
          }
          size={20}
          color={theme.text}
        />
      </TouchableOpacity>
      <Text style={[styles.headerCell, { color: theme.text }]}>Actions</Text>
    </View>
  );

  const renderExpenseRow = ({ item }: { item: ExpenseDTO }) => (
    <View style={[styles.row, { borderBottomColor: theme.border }] }>
      <Text style={[styles.dateCell, { color: theme.text }]}>{formatDate(item.expense_date)}</Text>
      <Text style={[styles.amountCell, { color: theme.text }]}>
        ${item.amount}
      </Text>
      <TouchableOpacity onPress={() => handleEditButtonClick(item)}>
        <Text style={[styles.editButton, { color: theme.primary }]}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>{selectedExpenseType}</Text>
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
