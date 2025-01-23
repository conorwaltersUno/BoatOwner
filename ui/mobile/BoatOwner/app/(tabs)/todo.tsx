import { CreateTaskDTO, TaskDTO } from "@/interfaces/todo";
import { deleteTask, fetchTasks, postTask } from "@/utils/todo.fetch";
import Constants from "expo-constants";
import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Button, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

export default function Todo() {
  const boatId = 1;
  const isLocalDev = process.env.EXPO_PUBLIC_IS_LOCAL_DEV;
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";

  const apiUrl = isLocalDev
    ? "http://" + Constants.expoConfig?.hostUri!.split(`:`).shift() + ":3010"
    : `https://${apiBaseUrl}:3010`;

  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(apiUrl, boatId),
    staleTime: 10 * 60 * 1000,
  });

  const addTaskMutation = useMutation({
    mutationFn: (newTask: { description: string; status: string; created_on: string }) =>
      postTask(apiUrl, boatId, {
        ...newTask,
        created_on: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTask(apiUrl, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // This will be updated in the future to get user input for a task
  const handleAddTask = () => {
    const newTask: CreateTaskDTO = { description: "New Task", status: "pending", created_on: new Date().toISOString() };
    addTaskMutation.mutate(newTask, {
      onError: (err: any) => Alert.alert("Error", err?.message || "Failed to add task"),
    });
  };

  const handleDeleteTask = (id: number) => {
    deleteMutation.mutate(id, {
      onError: (err: any) => Alert.alert("Error", err?.message || "Failed to add task"),
    });
  };

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const inProgressTasks = tasks.filter((task) => task.status === "inProgress");
  const completedTasks = tasks.filter((task) => task.status === "completed");

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

  const renderTaskCard = (task: TaskDTO) => (
    <View key={task.id} style={styles.taskCard}>
      <View style={styles.taskContent}>
        <View>
          <Text style={styles.taskDescription}>{task.description}</Text>
          <Text style={styles.taskStatus}>Status: {task.status}</Text>
        </View>
        <FontAwesome
          name="trash"
          color="red"
          size={20}
          onPress={() => handleDeleteTask(task.id)}
          style={styles.deleteIcon}
        />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.addContainer}>
        <Button title="Add a task" onPress={handleAddTask}></Button>
      </View>

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
  addContainer: {
    flex: 1,
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
  taskContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  deleteIcon: {
    marginLeft: 10,
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
