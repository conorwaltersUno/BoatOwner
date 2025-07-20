import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator, ScrollView, Alert, TouchableOpacity } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { FontAwesome } from "@expo/vector-icons";

import TaskModal from "../../components/TaskModal/TaskModal";
import { useAddTask, useGetTasks, useDeleteTask, useUpdateTask } from "../../hooks/index";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import { CreateTaskDTO, TaskDTO } from "@/interfaces/todo/todo";

export default function Todo() {
  const [isModalVisible, setModalVisible] = useState(false);

  const { data: tasks = [], isLoading, isError, error } = useGetTasks();
  const { mutate: addTask } = useAddTask();
  const { mutate: deleteTaskMutation } = useDeleteTask();
  const { mutate: updateTaskMutation } = useUpdateTask();
  const { theme } = useTheme();

  const handleAddTask = (description: string, status: string) => {
    const newTask: CreateTaskDTO = { description, status };
    addTask(newTask);
  };

  const handleDeleteTask = (id: number) => {
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this task?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTaskMutation(id),
      },
    ]);
  };

  const handleUpdateTask = (task: TaskDTO) => {
    updateTaskMutation(task);
  };

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const completedTasks = tasks.filter((task) => task.status === "completed");

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} testID="ActivityIndicator" />
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.background }]}> 
        <ThemedText style={[styles.errorText, { color: theme.error || '#E74C3C' }]}>{error?.message}</ThemedText>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={() => setModalVisible(true)}>
          <ThemedText style={styles.addButtonText}>+ Add a task</ThemedText>
        </TouchableOpacity>
        <TaskModal visible={isModalVisible} onClose={() => setModalVisible(false)} onSubmit={handleAddTask} />
      </ThemedView>
    );
  }

  if (tasks.length === 0) {
    return (
      <ThemedView style={[styles.emptyContainer, { backgroundColor: theme.background }]}> 
        <ThemedText style={[styles.emptyTitle, { color: theme.primary }]}>No Tasks Yet</ThemedText>
        <ThemedText style={[styles.emptySubtitle, { color: theme.text + '99' }]}>You haven't added any tasks. Tap below to create your first task!</ThemedText>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={() => setModalVisible(true)}>
          <ThemedText style={styles.addButtonText}>+ Add a task</ThemedText>
        </TouchableOpacity>
        <TaskModal visible={isModalVisible} onClose={() => setModalVisible(false)} onSubmit={handleAddTask} />
      </ThemedView>
    );
  }

  const renderDraggableTaskCard = (task: TaskDTO) => (
    <PanGestureHandler
      key={task.id}
      onHandlerStateChange={({ nativeEvent }) => {
        if (nativeEvent.state === State.END && nativeEvent.translationX > 100) {
          task.status = "completed";
          handleUpdateTask(task);
        } else if (nativeEvent.state === State.END && nativeEvent.translationX < 100) {
          task.status = "pending";
          handleUpdateTask(task);
        }
      }}
    >
      <ThemedView style={[styles.taskCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.taskContent}>
          <View>
            <ThemedText style={[styles.taskDescription, { color: theme.text }, task.status === "completed" && styles.completedTask]}>{task.description}</ThemedText>
            <ThemedText style={[styles.taskStatus, { color: theme.text + '99' }]}>Status: {task.status}</ThemedText>
          </View>
          <FontAwesome
            name="trash"
            color={theme.error || '#E74C3C'}
            size={20}
            onPress={() => handleDeleteTask(task.id)}
            style={styles.deleteIcon}
          />
        </View>
      </ThemedView>
    </PanGestureHandler>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>  
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary, marginBottom: 18, marginTop: 0 }]} onPress={() => setModalVisible(true)}>
          <ThemedText style={styles.addButtonText}>+ Add a task</ThemedText>
        </TouchableOpacity>
        <ThemedText style={[styles.sectionTitle, { color: theme.primary }]}>Pending Tasks</ThemedText>
        {pendingTasks.length === 0 ? (
          <ThemedText style={[styles.noTasksText, { color: theme.text + '99' }]}>No pending tasks</ThemedText>
        ) : (
          pendingTasks.map(renderDraggableTaskCard)
        )}
        <ThemedText style={[styles.sectionTitle, { color: theme.primary, marginTop: 24 }]}>Completed Tasks</ThemedText>
        {completedTasks.length === 0 ? (
          <ThemedText style={[styles.noTasksText, { color: theme.text + '99' }]}>No completed tasks</ThemedText>
        ) : (
          completedTasks.map(renderDraggableTaskCard)
        )}
        <TaskModal visible={isModalVisible} onClose={() => setModalVisible(false)} onSubmit={handleAddTask} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    marginBottom: 25,
    textAlign: "center",
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
  completedTask: {
    textDecorationLine: "line-through",
    color: "gray",
  },
  taskStatus: {
    fontSize: 14,
  },
  deleteIcon: {
    marginLeft: 10,
  },
  noTasksText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
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
});
