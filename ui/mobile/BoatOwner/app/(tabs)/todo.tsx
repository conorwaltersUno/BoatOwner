import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Button, Alert } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { FontAwesome } from "@expo/vector-icons";

import TaskModal from "../../components/TaskModal/TaskModal";
import { useAddTask, useGetTasks, useDeleteTask, useUpdateTask } from "../../hooks/index";

import { CreateTaskDTO, TaskDTO } from "@/interfaces/todo/todo";
import Constants from "expo-constants";
import { APIPort } from "@/constants/APIPort";

export default function Todo() {
  const [isModalVisible, setModalVisible] = useState(false);

  const { data: tasks = [], isLoading, isError, error } = useGetTasks();
  const { mutate: addTask } = useAddTask();
  const { mutate: deleteTaskMutation } = useDeleteTask();
  const { mutate: updateTaskMutation } = useUpdateTask();

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
      <View style={styles.taskCard}>
        <View style={styles.taskContent}>
          <View>
            <Text style={[styles.taskDescription, task.status === "completed" && styles.completedTask]}>
              {task.description}
            </Text>
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
    </PanGestureHandler>
  );

  return (
    <ScrollView style={styles.container}>
      <ScrollView style={styles.container}>
        <View style={styles.addContainer}>
          <Button title="Add a task" onPress={() => setModalVisible(true)} />
        </View>
      </ScrollView>
      <TaskModal visible={isModalVisible} onClose={() => setModalVisible(false)} onSubmit={handleAddTask} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Working on it</Text>
        {pendingTasks.length > 0 ? (
          pendingTasks.map(renderDraggableTaskCard)
        ) : (
          <Text style={styles.noTasksText}>No pending tasks</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Completed</Text>
        {completedTasks.length > 0 ? (
          completedTasks.map(renderDraggableTaskCard)
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
  completedTask: {
    textDecorationLine: "line-through",
    color: "gray",
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
