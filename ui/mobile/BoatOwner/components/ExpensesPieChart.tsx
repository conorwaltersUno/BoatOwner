import React, { useState } from "react";
import { Text, StyleSheet } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { FormattedExpensesForPieChart } from "../interfaces/expenses/expense";

interface ExpensesPieChartProps {
  expenses: FormattedExpensesForPieChart[];
  selectedExpenseType: string | null;
}

const ExpensesPieChart: React.FC<ExpensesPieChartProps> = ({ expenses, selectedExpenseType }) => {
  return (
    <PieChart
      data={expenses}
      donut
      textSize={12}
      radius={160}
      innerRadius={80}
      edgesPressable={true}
      centerLabelComponent={() =>
        selectedExpenseType ? (
          <>
            <Text style={styles.centerLabel}>{`${selectedExpenseType}`}</Text>

            <Text style={styles.totalText}>
              {expenses
                .filter((e) => e.text === selectedExpenseType)
                .reduce((total, expense) => total + expense.value, 0)}
            </Text>
          </>
        ) : (
          <Text style={styles.centerLabel}>Select an Expense</Text>
        )
      }
    />
  );
};

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
});

export default ExpensesPieChart;
