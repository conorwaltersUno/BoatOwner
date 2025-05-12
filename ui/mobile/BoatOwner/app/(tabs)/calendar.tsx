import LogDetailModal from "@/components/LogDetailModal";
import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { useGetLogs } from "../../hooks/index";
import { UpdateLogDTO } from "../../interfaces/log/log";

export default function CalendarLogsView() {
  const { data: logs = [], isLoading, isError, error } = useGetLogs();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<UpdateLogDTO | null>(null);
  const [isDetailModalVisible, setDetailModalVisible] = useState(false);
  const [isLogSelectionModalVisible, setLogSelectionModalVisible] = useState(false);

  const logsByDate = useMemo(() => {
    return logs.reduce((acc, log) => {
      const logDate = new Date(log.log_started || log.created_on).toISOString().split("T")[0];
      if (!acc[logDate]) {
        acc[logDate] = [];
      }
      acc[logDate].push(log);
      return acc;
    }, {} as Record<string, UpdateLogDTO[]>);
  }, [logs]);

  const markedDates = useMemo(() => {
    return Object.keys(logsByDate).reduce((acc, date) => {
      acc[date] = {
        marked: true,
        dotColor: logsByDate[date].length > 1 ? "red" : "blue",
      };
      return acc;
    }, {} as Record<string, { marked: boolean; dotColor?: string }>);
  }, [logsByDate]);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    const logsOnDate = logsByDate[day.dateString] || [];

    if (logsOnDate.length === 1) {
      setSelectedLog(logsOnDate[0]);
      setDetailModalVisible(true);
    } else if (logsOnDate.length > 1) {
      setLogSelectionModalVisible(true);
    }
  };

  const renderLogSelectionModal = () => {
    const logsOnDate = selectedDate ? logsByDate[selectedDate] || [] : [];

    return (
      <Modal visible={isLogSelectionModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.selectionModalContainer}>
            <Text style={styles.selectionModalTitle}>Logs on {selectedDate}</Text>
            <FlatList
              data={logsOnDate}
              keyExtractor={(item, index) => `${selectedDate}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.logSelectionItem}
                  onPress={() => {
                    setSelectedLog(item);
                    setLogSelectionModalVisible(false);
                    setDetailModalVisible(true);
                  }}
                >
                  <Text style={styles.logSelectionItemText}>{item.description || "Unnamed Log"}</Text>
                  <Text style={styles.logSelectionItemSubtext}>
                    {new Date(item.log_started || item.created_on).toLocaleTimeString()}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.noLogsText}>No logs found for this date</Text>}
            />
            <TouchableOpacity
              style={styles.closeSelectionModalButton}
              onPress={() => setLogSelectionModalVisible(false)}
            >
              <Text style={styles.closeSelectionModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading logs...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text>Error loading logs: {error?.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        monthFormat={"MMMM yyyy"}
        theme={{
          selectedDayBackgroundColor: "#2E66E7",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#2E66E7",
          arrowColor: "#2E66E7",
        }}
      />

      {renderLogSelectionModal()}

      {selectedLog && (
        <LogDetailModal
          modalVisibility={isDetailModalVisible}
          setModalVisibility={setDetailModalVisible}
          log={selectedLog}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  selectionModalContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    maxHeight: "70%",
  },
  selectionModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  logSelectionItem: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  logSelectionItemText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  logSelectionItemSubtext: {
    fontSize: 14,
    color: "#666",
  },
  noLogsText: {
    textAlign: "center",
    color: "#888",
    marginVertical: 20,
  },
  closeSelectionModalButton: {
    marginTop: 15,
    backgroundColor: "#2E66E7",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  closeSelectionModalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
