import { CreateExpenseDTO } from "@/interfaces/expenses/expense";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { useAddExpense, useGetExpenses } from "../../hooks/index";
import AddExpenseModal from "@/components/AddExpenseModal";
import ExpenseTable from "@/components/ExpenseTable";
import ExpensesPieChart from "@/components/ExpensesPieChart";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useDataPrefetch } from "@/context/DataPrefetchContext";

export default function Expenses() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedExpenseType, setSelectedExpenseType] = useState<string | null>(null);

  const { data: expenses = [], isLoading, isError, error } = useGetExpenses();
  const { mutate: addExpense } = useAddExpense();
  const { theme } = useTheme();
  const { prefetching } = useDataPrefetch();

  const handleAddExpense = async (newExpense: CreateExpenseDTO) => {
    addExpense(newExpense);
  };

  const handleOutsidePress = () => {
    setSelectedExpenseType(null);
  };

  if (prefetching) {
    return <ThemedView style={styles.centeredContainer} />;
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={[styles.loadingText, { color: theme.primary }]}>Loading expenses...</ThemedText>
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ThemedText style={[styles.errorTitle, { color: '#E74C3C' }]}>Something went wrong</ThemedText>
        <ThemedText style={[styles.errorText, { color: '#E74C3C' }]}>{error?.message || "Unable to load expenses."}</ThemedText>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
          onPress={() => {
            /* Optionally add a refetch here */
          }}
        >
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (expenses.length === 0) {
    return (
      <ThemedView style={[styles.emptyContainer, { backgroundColor: theme.background }] }>
        <ThemedText style={[styles.emptyTitle, { color: theme.primary }]}>No Expenses Yet</ThemedText>
        <ThemedText style={[styles.emptySubtitle, { color: theme.text + '99' }]}>You haven't recorded any expenses. Tap below to add your first expense!</ThemedText>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={() => setModalVisible(true)}>
          <ThemedText style={styles.addButtonText}>+ Add a new expense</ThemedText>
        </TouchableOpacity>
        <AddExpenseModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleAddExpense}
          testID="AddExpenseModal"
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background }] }>
      <ThemedView style={[styles.headerRow, { backgroundColor: theme.card, borderBottomColor: theme.border }] }>
        <ThemedText style={[styles.pageTitle, { color: theme.primary }]}>Expenses</ThemedText>
        <TouchableOpacity style={[styles.addButtonSmall, { backgroundColor: theme.primary }]} onPress={() => setModalVisible(true)}>
          <ThemedText style={styles.addButtonTextSmall}>+ Add</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <ThemedView style={[styles.pieCard, { backgroundColor: theme.card, paddingVertical: 8, marginBottom: 6, minHeight: 140 }] }>
          <ThemedText style={[styles.sectionTitle, { color: theme.primary }]}>Spending Breakdown</ThemedText>
          <ExpensesPieChart
            expenses={expenses}
            selectedExpenseType={selectedExpenseType}
            setSelectedExpenseType={setSelectedExpenseType}
          />
        </ThemedView>
      </TouchableWithoutFeedback>
      <AddExpenseModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddExpense}
        testID="AddExpenseModal"
      />
      <ThemedText style={[styles.sectionTitle, { marginLeft: 18, marginTop: 8, color: theme.primary }]}>Expense Details</ThemedText>
      {selectedExpenseType ? (
        <ExpenseTable
          expenses={expenses}
          selectedExpenseType={selectedExpenseType}
          setSelectedExpenseType={setSelectedExpenseType}
        />
      ) : (
        <ThemedText style={[styles.centerLabel, { color: theme.text + '99' }]}>Tap a category in the chart to view details.</ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 30,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e3e8f0",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E66E7",
  },
  addButton: {
    backgroundColor: "#2E66E7",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 18,
    marginBottom: 8,
    alignItems: "center",
    shadowColor: "#2E66E7",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  addButtonSmall: {
    backgroundColor: "#2E66E7",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: "center",
  },
  addButtonTextSmall: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  pieCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2E66E7",
    marginBottom: 10,
    textAlign: "left",
    alignSelf: "flex-start",
  },
  informationCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    flex: 1,
    minHeight: 220,
    maxHeight: 350,
    justifyContent: "flex-start",
    overflow: "hidden", // Ensures children don't overflow the card
  },
  informationContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E74C3C",
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#2E66E7",
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
    marginTop: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#2E66E7",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    backgroundColor: "#fff",
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E66E7",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 25,
    textAlign: "center",
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
  centerLabel: {
    fontSize: 16,
    textAlign: "center",
    color: "#888",
    marginTop: 18,
  },
  tableContainer: {
    flex: 1,
    width: "100%",
    maxHeight: 180, // Reduce max height for a tighter fit
    overflow: "hidden",
  },
  fullWidthTableScroll: {
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
    paddingHorizontal: 0,
    backgroundColor: "#fff",
    marginBottom: 18,
    borderRadius: 0,
    // Remove maxHeight so it can grow as needed
  },
});
