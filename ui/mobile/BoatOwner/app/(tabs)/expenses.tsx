import { CreateExpenseDTO, ExpenseDTO, FormattedExpensesForPieChart } from "@/interfaces/expenses/expense";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  SafeAreaView,
  Button,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { useAddExpense, useGetExpenses } from "../../hooks/index";
import AddExpenseModal from "@/components/AddExpenseModal";
import ExpenseTable from "@/components/ExpenseTable";
import ExpensesPieChart from "@/components/ExpensesPieChart";

export default function Expenses() {
  const [isModalVisible, setModalVisible] = useState(false);
  const boatId = 1;
  const [selectedExpenseType, setSelectedExpenseType] = useState<string | null>(null);

  const { data: expenses = [], isLoading, isError, error } = useGetExpenses(boatId);
  const { mutate: addExpense } = useAddExpense(boatId);

  const handleAddExpense = async (newExpense: CreateExpenseDTO) => {
    addExpense(newExpense);
  };

  const handleOutsidePress = () => {
    setSelectedExpenseType(null);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error?.message}</Text>
      </View>
    );
  }

  if (expenses.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noExpensesText}>No expenses, please record an expense to get started!</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View style={styles.pieContainer}>
          <ExpensesPieChart
            expenses={expenses}
            selectedExpenseType={selectedExpenseType}
            setSelectedExpenseType={setSelectedExpenseType}
          ></ExpensesPieChart>
        </View>
      </TouchableWithoutFeedback>
      <View>
        <Button title="Add a new expense" onPress={() => setModalVisible(true)} />
      </View>
      <AddExpenseModal visible={isModalVisible} onClose={() => setModalVisible(false)} onSubmit={handleAddExpense} />
      <View style={styles.informationContainer}>
        {selectedExpenseType ? (
          <ScrollView horizontal style={styles.tableContainer}>
            <ExpenseTable
              expenses={expenses}
              selectedExpenseType={selectedExpenseType}
              setSelectedExpenseType={setSelectedExpenseType}
            />
          </ScrollView>
        ) : (
          <Text>Select an expense to view details</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  expenseItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 10,
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "center",
  },
  pieContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
  },
  informationContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  noExpensesText: {
    color: "#555",
    fontSize: 16,
    textAlign: "center",
  },
  centerLabel: {
    fontSize: 16,
    textAlign: "center",
    color: "#000",
  },
  tableContainer: {
    maxHeight: "95%",
  },
});
