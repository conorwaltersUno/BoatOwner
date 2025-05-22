import LogDetailModal from "@/components/LogDetailModal";
import React, { useState, useMemo, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Button, Dimensions } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { useGetLogs } from "../../hooks/index";
import { UpdateLogDTO, LogDTO } from "../../interfaces/log/log";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

function getYearStats(logs: LogDTO[]) {
  const currentYear = new Date().getFullYear();
  const yearLogs = logs.filter(
    (log) =>
      (log.log_started && new Date(log.log_started).getFullYear() === currentYear) ||
      (log.created_on && new Date(log.created_on).getFullYear() === currentYear)
  );

  let totalMs = 0,
    totalCrew = 0,
    totalPoints = 0,
    longestTrip = 0,
    shortestTrip = Number.MAX_SAFE_INTEGER,
    totalDistance = 0;

  yearLogs.forEach((log) => {
    if (log.log_started && log.log_ended) {
      const ms = new Date(log.log_ended).getTime() - new Date(log.log_started).getTime();
      totalMs += ms;
      if (ms > longestTrip) longestTrip = ms;
      if (ms < shortestTrip) shortestTrip = ms;
    }
    totalCrew += Array.isArray(log.crew_members) ? log.crew_members.length : 0;
    totalPoints += Array.isArray(log.coordinates) ? log.coordinates.length : 0;

    if (Array.isArray(log.coordinates) && log.coordinates.length > 1) {
      for (let i = 1; i < log.coordinates.length; i++) {
        const prev = log.coordinates[i - 1];
        const curr = log.coordinates[i];
        const dx = curr.latitude - prev.latitude;
        const dy = curr.longitude - prev.longitude;
        totalDistance += Math.sqrt(dx * dx + dy * dy);
      }
    }
  });

  const numLogs = yearLogs.length;
  const totalHours = totalMs / (1000 * 60 * 60);
  const longestHours = longestTrip ? (longestTrip / (1000 * 60 * 60)).toFixed(1) : "0";
  const shortestHours = shortestTrip !== Number.MAX_SAFE_INTEGER ? (shortestTrip / (1000 * 60 * 60)).toFixed(1) : "0";
  const avgCrew = numLogs ? (totalCrew / numLogs).toFixed(1) : "0";
  const totalDistanceNm = (totalDistance * 60).toFixed(1); // fake conversion to nautical miles

  return {
    numLogs,
    totalHours: totalHours.toFixed(1),
    avgCrew,
    totalPoints,
    longestHours,
    shortestHours,
    totalDistanceNm,
  };
}

export default function CalendarLogsView() {
  const { data: logs = [], isLoading, isError, error } = useGetLogs();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<UpdateLogDTO | null>(null);
  const [isDetailModalVisible, setDetailModalVisible] = useState(false);
  const [isLogSelectionModalVisible, setLogSelectionModalVisible] = useState(false);

  const logsByDate = useMemo(() => {
    return logs.reduce((acc, log) => {
      const logDate = new Date(log.log_started || log.created_on).toISOString().split("T")[0];
      if (!acc[logDate]) acc[logDate] = [];
      acc[logDate].push(log);
      return acc;
    }, {} as Record<string, UpdateLogDTO[]>);
  }, [logs]);

  const markedDates = useMemo(() => {
    return Object.keys(logsByDate).reduce((acc, date) => {
      acc[date] = {
        marked: true,
        dotColor: logsByDate[date].length > 1 ? "#E74C3C" : "#2E66E7",
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
              keyExtractor={(_, index) => `${selectedDate}-${index}`}
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

  if (!isLoading && logs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Logs Yet</Text>
        <Text style={styles.emptySubtitle}>
          You haven't recorded any logs. Tap below to go to the home page and record your first log!
        </Text>
        <Button title="Go to Home" onPress={() => router.replace("/(tabs)/(home)")} />
      </View>
    );
  }

  const stats = getYearStats(logs);

  return (
    <View style={styles.flexFill}>
      <View style={styles.calendarHeader}>
        <Text style={styles.calendarHeaderTitle}>Your Log Calendar</Text>
      </View>
      <View style={styles.flexGrow}>
        <Calendar
          markedDates={{
            ...markedDates,
            ...(selectedDate
              ? {
                  [selectedDate]: {
                    ...(markedDates[selectedDate] || {}),
                    selected: true,
                    selectedColor: "#2E66E7",
                  },
                }
              : {}),
          }}
          onDayPress={handleDayPress}
          current={selectedDate || undefined}
          monthFormat={"MMMM yyyy"}
          theme={{
            backgroundColor: "#fff",
            calendarBackground: "#fff",
            selectedDayBackgroundColor: "#2E66E7",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "#2E66E7",
            arrowColor: "#2E66E7",
            textSectionTitleColor: "#2E66E7",
            dayTextColor: "#222",
            textDisabledColor: "#d9e1e8",
            dotColor: "#2E66E7",
            selectedDotColor: "#fff",
            textDayFontWeight: "500",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "600",
            textDayFontSize: 16,
            textMonthFontSize: 20,
            textDayHeaderFontSize: 14,
          }}
          style={[styles.calendar, { width: SCREEN_WIDTH }]}
        />
      </View>
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Yearly Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statsGridRow}>
            <View style={styles.statsGridItem}>
              <Text style={styles.statsValue}>{stats.numLogs}</Text>
              <Text style={styles.statsLabel}>Logs</Text>
            </View>
            <View style={styles.statsGridItem}>
              <Text style={styles.statsValue}>{stats.totalHours}</Text>
              <Text style={styles.statsLabel}>Hours Travelling</Text>
            </View>
          </View>
          <View style={styles.statsGridRow}>
            <View style={styles.statsGridItem}>
              <Text style={styles.statsValue}>{stats.avgCrew}</Text>
              <Text style={styles.statsLabel}>Avg. Crew</Text>
            </View>
            <View style={styles.statsGridItem}>
              <Text style={styles.statsValue}>{stats.totalDistanceNm}</Text>
              <Text style={styles.statsLabel}>Distance (nm)</Text>
            </View>
          </View>
          <View style={styles.statsGridRow}>
            <View style={styles.statsGridItem}>
              <Text style={styles.statsValue}>{stats.longestHours}</Text>
              <Text style={styles.statsLabel}>Longest Trip</Text>
            </View>
            <View style={styles.statsGridItem}>
              <Text style={styles.statsValue}>{stats.shortestHours}</Text>
              <Text style={styles.statsLabel}>Shortest Trip</Text>
            </View>
          </View>
        </View>
      </View>

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
  flexFill: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  flexGrow: {
    flex: 1,
    justifyContent: "center",
  },
  calendarHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 32,
    marginBottom: 8,
  },
  calendarHeaderTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E66E7",
  },
  calendar: {
    alignSelf: "center",
    minHeight: SCREEN_HEIGHT * 0.55,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 18,
    marginTop: 2,
  },
  statsCard: {
    width: "94%",
    backgroundColor: "#F0EFF4",
    borderRadius: 16,
    padding: 18,
    marginLeft: 12,
    marginTop: 8,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "#b0b3bb",
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E66E7",
    marginBottom: 10,
    textAlign: "left",
  },
  statsGrid: {
    flexDirection: "column",
    gap: 8,
  },
  statsGridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  statsGridItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
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
