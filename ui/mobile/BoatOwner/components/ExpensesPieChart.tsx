import React, { Dispatch, SetStateAction } from "react";
import { Text, View, StyleSheet } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { FormattedExpensesForPieChart, ExpenseDTO } from "../interfaces/expenses/expense";

interface ExpensesPieChartProps {
  expenses: ExpenseDTO[];
  selectedExpenseType: string | null;
  setSelectedExpenseType: Dispatch<SetStateAction<string | null>>;
}

const COLORS = ["#4E8098", "#00A9A5", "#0B5351", "#092327", "#90C2E7"];

const ExpensesPieChart: React.FC<ExpensesPieChartProps> = ({
  expenses,
  selectedExpenseType,
  setSelectedExpenseType,
}) => {
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

  return (
    <PieChart
      data={formattedData}
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
              {formattedData
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
