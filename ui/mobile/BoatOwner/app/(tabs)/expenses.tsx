import { CreateExpenseDTO, ExpenseDTO, FormattedExpensesForPieChart } from "@/interfaces/expenses/expense";
import Constants from "expo-constants";
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
import { APIPort } from "@/constants/APIPort";
import React, { useState } from "react";
import { useAddExpense, useGetExpenses } from "../../hooks/index";
import AddExpenseModal from "@/components/AddExpenseModal";
import ExpenseTable from "@/components/ExpenseTable";
import ExpensesPieChart from "@/components/ExpensesPieChart";

const COLORS = ["#4E8098", "#00A9A5", "#0B5351", "#092327", "#90C2E7"];

export default function Expenses() {
  const [isModalVisible, setModalVisible] = useState(false);
  const boatId = 1;
  const isLocalDev = process.env.EXPO_PUBLIC_IS_LOCAL_DEV;
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
  const [selectedExpenseType, setSelectedExpenseType] = useState<string | null>(null);

  const apiUrl = isLocalDev
    ? "http://" + Constants.expoConfig?.hostUri!.split(`:`).shift() + `:${APIPort.localPort}`
    : `https://${apiBaseUrl}:${APIPort.localPort}`;

  const { data: expenses = [], isLoading, isError, error } = useGetExpenses(apiUrl, boatId);
  const { mutate: addExpense } = useAddExpense(apiUrl, boatId);

  const handleAddExpense = async (newExpense: CreateExpenseDTO) => {
    addExpense(newExpense);
  };

  let total = 0;
  expenses.forEach((ex) => {
    total += parseFloat(String(ex.amount));
  });

  const groupedExpenses = expenses.reduce<Record<string, number>>((acc, expense) => {
    const amount = parseFloat(String(expense.amount));
    acc[expense.expense_type] = (acc[expense.expense_type] || 0) + amount;
    return acc;
  }, {});

  const formattedData: FormattedExpensesForPieChart[] = Object.entries(groupedExpenses).map(
    ([type, amount], index) => ({
      value: amount,
      color: COLORS[index % COLORS.length],
      text: type,
      textColor: "white",
      onPress: () => {
        setSelectedExpenseType(type);
      },
    })
  );

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
            expenses={formattedData}
            selectedExpenseType={selectedExpenseType}
            total={total}
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
            <ExpenseTable expenses={expenses} selectedExpenseType={selectedExpenseType} />
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
