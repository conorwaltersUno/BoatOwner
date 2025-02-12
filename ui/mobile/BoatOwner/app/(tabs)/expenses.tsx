import { CreateExpenseDTO } from "@/interfaces/expenses/expense";
import { addExpense, deleteExpense, fetchExpenses } from "../../api/fetch/expenses.fetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

export default function expenses() {
  const boatId = 1;
  const isLocalDev = process.env.EXPO_PUBLIC_IS_LOCAL_DEV;
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";

  const apiUrl = isLocalDev
    ? "http://" + Constants.expoConfig?.hostUri!.split(`:`).shift() + ":3010"
    : `https://${apiBaseUrl}:3010`;

  const queryClient = useQueryClient();
  const {
    data: expenses = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => fetchExpenses(apiUrl, boatId),
    staleTime: 10 * 60 * 1000,
  });

  const addExpenseMutation = useMutation({
    mutationFn: (newExpense: CreateExpenseDTO) => addExpense(apiUrl, boatId, newExpense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (expenseId: number) => deleteExpense(apiUrl, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  const handleAddExpense = async (newExpense: CreateExpenseDTO) => {
    try {
      await addExpenseMutation.mutateAsync(newExpense);
    } catch (err) {
      console.error("Failed to add expense:", err);
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    try {
      await deleteExpenseMutation.mutateAsync(expenseId);
    } catch (err) {
      console.error("Failed to delete expense:", err);
    }
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

  return (
    <View style={styles.container}>
      <Text>Expenses</Text>
      {expenses.map((expense) => (
        <View key={expense.id}>
          <Text>{expense.expense_type}</Text>
          <Text>{expense.amount}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});
