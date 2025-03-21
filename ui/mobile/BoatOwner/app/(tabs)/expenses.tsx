import { CreateExpenseDTO, ExpenseDTO } from "@/interfaces/expenses/expense";
import { fetchExpenses } from "../../api/fetch/expenses.fetch";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  SafeAreaView,
  Button,
} from "react-native";
import { APIPort } from "@/constants/APIPort";
import { PieChart } from "react-native-gifted-charts";
import React, { useState } from "react";
import { useAddExpense, useGetExpenses } from "../../hooks/index";
import AddExpenseModal from "@/components/ExpenseModal/AddExpenseModal";

const COLORS = ["#4E8098", "#00A9A5", "#0B5351", "#092327", "#90C2E7"];

export default function Expenses() {
  const [isModalVisible, setModalVisible] = useState(false);
  const boatId = 1;
  const isLocalDev = process.env.EXPO_PUBLIC_IS_LOCAL_DEV;
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
  const [selectedExpense, setSelectedExpense] = useState<ExpenseDTO | null>(null);

  const apiUrl = isLocalDev
    ? "http://" + Constants.expoConfig?.hostUri!.split(`:`).shift() + `:${APIPort.localPort}`
    : `https://${apiBaseUrl}:${APIPort.localPort}`;

  const { data: expenses = [], isLoading, isError, error } = useGetExpenses(apiUrl, boatId);
  const { mutate: addExpense } = useAddExpense(apiUrl, boatId);

  const handleAddExpense = async (newExpense: CreateExpenseDTO) => {
    addExpense(newExpense);
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

  const formattedData = expenses.map((expense: ExpenseDTO, index: number) => ({
    value: expense.amount,
    color: COLORS[index % COLORS.length],
    text: expense.expense_type,
    textColor: "white",
    onPress: () => setSelectedExpense(expense),
  }));

  const handleOutsidePress = () => {
    setSelectedExpense(null);
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <SafeAreaView style={styles.container}>
        <View style={styles.pieContainer}>
          <PieChart
            data={formattedData}
            donut
            textSize={12}
            radius={160}
            focusOnPress
            innerRadius={80}
            edgesPressable={true}
            centerLabelComponent={() =>
              selectedExpense ? (
                <Text style={styles.centerLabel}>{`${selectedExpense.expense_type}\n$${selectedExpense.amount}`}</Text>
              ) : (
                <Text style={styles.centerLabel}>Select an Expense</Text>
              )
            }
          />
        </View>
        <View>
          <Button title="Add a new expense" onPress={() => setModalVisible(true)} />
        </View>
        <AddExpenseModal visible={isModalVisible} onClose={() => setModalVisible(false)} onSubmit={handleAddExpense} />
        <View style={styles.informationContainer}>
          {selectedExpense ? (
            <Text>{`Expense Type: ${selectedExpense.expense_type}, Amount: ${selectedExpense.amount}`}</Text>
          ) : (
            <Text>Select an expense to view details</Text>
          )}
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});
