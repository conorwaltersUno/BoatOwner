import { TaskDTO } from "@/interfaces/todo";
import Constants from "expo-constants";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";

export default function Todo() {
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const boatId = 1;
  const isLocalDev = process.env.EXPO_PUBLIC_IS_LOCAL_DEV || "Missing isLocalDev variable";
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";

  const apiUrl = isLocalDev
    ? "http://" + Constants.expoConfig?.hostUri!.split(`:`).shift() + ":3010"
    : `https://${apiBaseUrl}:3010`;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`${apiUrl}/tasks/boat/${boatId}/tasks`);
        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.statusText}`);
        }
        const data: TaskDTO[] = await response.json();
        setTasks(data);
      } catch (err: any) {
        console.log(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [apiUrl, boatId]);

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const inProgressTasks = tasks.filter((task) => task.status === "inProgress");
  const completedTasks = tasks.filter((task) => task.status === "completed");

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderTaskCard = (task: TaskDTO) => (
    <View key={task.id} style={styles.taskCard}>
      <Text style={styles.taskDescription}>{task.description}</Text>
      <Text style={styles.taskStatus}>Status: {task.status}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending</Text>
        {pendingTasks.length > 0 ? (
          pendingTasks.map(renderTaskCard)
        ) : (
          <Text style={styles.noTasksText}>No pending tasks</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>In Progress</Text>
        {inProgressTasks.length > 0 ? (
          inProgressTasks.map(renderTaskCard)
        ) : (
          <Text style={styles.noTasksText}>No in-progress tasks</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Completed</Text>
        {completedTasks.length > 0 ? (
          completedTasks.map(renderTaskCard)
        ) : (
          <Text style={styles.noTasksText}>No completed tasks</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  section: {
    flex: 1,
    marginBottom: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  taskCard: {
    backgroundColor: "#e0f7fa",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  taskDescription: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  taskStatus: {
    fontSize: 14,
    color: "#616161",
  },
  noTasksText: {
    fontSize: 14,
    color: "#9e9e9e",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});
