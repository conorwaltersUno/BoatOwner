import React, { Dispatch, SetStateAction } from "react";
import { Text, View, StyleSheet } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { FormattedExpensesForPieChart, ExpenseDTO } from "../interfaces/expenses/expense";
import { useTheme } from "@/context/ThemeContext";

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
  const { theme } = useTheme();

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
          <View style={[styles.centerLabelContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.labelText, { color: theme.text }]}>{selectedExpenseType}</Text>
            <Text style={[styles.totalText, { color: theme.text }]}>
              £
              {formattedData
                .filter((e) => e.text === selectedExpenseType)
                .reduce((total, expense) => total + expense.value, 0)
                .toFixed(2)}
            </Text>
          </View>
        ) : (
          <View style={[styles.centerLabelContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.centerLabel, { color: theme.text }]}>Total: £{total.toFixed(2)}</Text>
          </View>
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
    borderRadius: 80, // match innerRadius for perfect circle
    minWidth: 160, // match inner diameter
    minHeight: 160, // match inner diameter
    overflow: "hidden",
    // backgroundColor is set inline with theme.background
  },
  labelText: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  totalText: {
    fontSize: 20,
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
  },
});

export default ExpensesPieChart;
