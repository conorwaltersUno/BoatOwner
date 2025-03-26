import React, { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { FormattedExpensesForPieChart } from "../interfaces/expenses/expense";

interface ExpensesPieChartProps {
  expenses: FormattedExpensesForPieChart[];
  selectedExpenseType: string | null;
  total: number;
}

const ExpensesPieChart: React.FC<ExpensesPieChartProps> = ({ expenses, selectedExpenseType, total }) => {
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
          <View style={styles.centerLabelContainer}>
            <Text style={styles.labelText}>{selectedExpenseType}</Text>
            <Text style={styles.totalText}>
              £
              {expenses
                .filter((e) => e.text === selectedExpenseType)
                .reduce((total, expense) => total + expense.value, 0)
                .toFixed(2)}
            </Text>
          </View>
        ) : (
          <Text style={styles.centerLabel}>Total: £{total.toFixed(2)}</Text>
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerLabelContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  labelText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginRight: 8,
  },
  totalText: {
    fontSize: 20,
    color: "#000",
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
    color: "#000",
  },
});

export default ExpensesPieChart;
