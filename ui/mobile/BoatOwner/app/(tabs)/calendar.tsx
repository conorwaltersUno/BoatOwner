import LogDetailModal from "@/components/LogDetailModal";
import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Button, Dimensions } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { useGetLogs } from "../../hooks/index";
import { UpdateLogDTO, LogDTO } from "../../interfaces/log/log";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useDataPrefetch } from "@/context/DataPrefetchContext";

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
  const totalDistanceNm = (totalDistance * 60).toFixed(1);

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
  const { theme, isDark } = useTheme();
  const { prefetching } = useDataPrefetch();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<LogDTO | null>(null);
  const [isDetailModalVisible, setDetailModalVisible] = useState(false);
  const [isLogSelectionModalVisible, setLogSelectionModalVisible] = useState(false);

  const logsByDate = useMemo(() => {
    return logs.reduce((acc, log) => {
      const logDate = new Date(log.log_started || log.created_on).toISOString().split("T")[0];
      if (!acc[logDate]) acc[logDate] = [];
      acc[logDate].push(log);
      return acc;
    }, {} as Record<string, LogDTO[]>);
  }, [logs]);

  const markedDates = useMemo(() => {
    return Object.keys(logsByDate).reduce((acc, date) => {
      acc[date] = {
        marked: true,
        dotColor: logsByDate[date].length > 1 ? '#E74C3C' : theme.primary,
      };
      return acc;
    }, {} as Record<string, { marked: boolean; dotColor?: string }>);
  }, [logsByDate, theme.primary]);

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
        <ThemedView style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }] }>
          <ThemedView style={[
            styles.selectionModalContainer,
            {
              backgroundColor: theme.card,
              shadowColor: theme.text,
              shadowOpacity: 0.18,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
            },
          ]}>
            <ThemedText style={[styles.selectionModalTitle, { color: theme.primary, fontSize: 22, fontWeight: 'bold', marginBottom: 18, textAlign: 'center' }]}>Logs on {selectedDate}</ThemedText>
            <FlatList
              data={logsOnDate}
              keyExtractor={(_, index) => `${selectedDate}-${index}`}
              renderItem={({ item }) => (
                <ThemedView style={{
                  backgroundColor: theme.background,
                  borderRadius: 10,
                  marginBottom: 12,
                  padding: 14,
                  shadowColor: theme.text,
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedLog(item);
                      setLogSelectionModalVisible(false);
                      setDetailModalVisible(true);
                    }}
                  >
                    <ThemedText style={[styles.logSelectionItemText, { color: theme.text }]}>{item.description || "Unnamed Log"}</ThemedText>
                    <ThemedText style={[styles.logSelectionItemSubtext, { color: theme.text + '99' }]}> {new Date(item.log_started || item.created_on).toLocaleTimeString()} </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              )}
              ListEmptyComponent={<ThemedText style={styles.noLogsText}>No logs found for this date</ThemedText>}
            />
            <TouchableOpacity
              style={[styles.closeSelectionModalButton, { backgroundColor: theme.primary }]}
              onPress={() => setLogSelectionModalVisible(false)}
            >
              <ThemedText style={styles.closeSelectionModalButtonText}>Close</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>
    );
  };

  if (prefetching) {
    return <ThemedView style={[styles.container, { backgroundColor: theme.background }]} />;
  }

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.background }] }>
        <ThemedText>Loading logs...</ThemedText>
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.background }] }>
        <ThemedText>Error loading logs: {error?.message}</ThemedText>
      </ThemedView>
    );
  }

  if (!isLoading && logs.length === 0) {
    return (
      <ThemedView style={[styles.emptyContainer, { backgroundColor: theme.background }] }>
        <ThemedText style={[styles.emptyTitle, { color: theme.primary }]}>No Logs Yet</ThemedText>
        <ThemedText style={[styles.emptySubtitle, { color: theme.text + '99' }]}>You haven't recorded any logs. Tap below to go to the home page and record your first log!</ThemedText>
        <Button title="Go to Home" onPress={() => router.replace("/(tabs)")} />
      </ThemedView>
    );
  }

  const stats = getYearStats(logs);

  return (
    <ThemedView style={[styles.flexFill, { backgroundColor: theme.background }] }>
      <ThemedView style={[
        styles.statsCardFixed,
        {
          marginLeft: 10,
          marginRight: 10,
          marginTop: 10,
          marginBottom: 14, // add space below calendar card
          borderColor: theme.border,
          backgroundColor: theme.card,
          padding: 0, // remove extra padding
        },
      ]}>
        <ThemedView style={[styles.calendarHeader, { backgroundColor: 'transparent', borderRadius: 0, marginLeft: 0, marginRight: 0 }] }>
          <ThemedText style={[styles.calendarHeaderTitle, { color: theme.primary }]}>Your Log Calendar</ThemedText>
        </ThemedView>
        <ThemedView style={[styles.flexGrow, { backgroundColor: 'transparent', borderRadius: 0, marginLeft: 0, marginRight: 0, paddingBottom: 0 }] }>
          <Calendar
            key={isDark ? 'dark' : 'light'} // force remount on theme change
            markedDates={{
              ...markedDates,
              ...(selectedDate
                ? {
                    [selectedDate]: {
                      ...(markedDates[selectedDate] || {}),
                      selected: true,
                      selectedColor: theme.primary,
                    },
                  }
                : {}),
            }}
            onDayPress={handleDayPress}
            current={selectedDate || undefined}
            monthFormat={"MMMM yyyy"}
            theme={{
              backgroundColor: theme.background,
              calendarBackground: theme.background,
              todayBackgroundColor: theme.background,
              selectedDayBackgroundColor: theme.primary,
              selectedDayTextColor: theme.background,
              todayTextColor: theme.primary,
              arrowColor: theme.primary,
              textSectionTitleColor: theme.primary,
              dayTextColor: theme.text,
              textDisabledColor: theme.border,
              dotColor: theme.primary,
              selectedDotColor: theme.background,
              textDayFontWeight: "500",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "600",
              textDayFontSize: 16,
              textMonthFontSize: 20,
              textDayHeaderFontSize: 14,
            }}
            style={[
              styles.calendar,
              {
                backgroundColor: theme.background,
                minHeight: SCREEN_HEIGHT * 0.28,
                maxHeight: SCREEN_HEIGHT * 0.32,
                marginBottom: 8,
                marginTop: 2,
              },
            ]}
          />
        </ThemedView>
      </ThemedView>
      <ThemedView style={[
        styles.statsCardFixed,
        {
          backgroundColor: theme.cardSecondary || (isDark ? '#232a36' : '#f7f8fa'),
          borderColor: theme.border,
          marginTop: 40,
        },
      ]}>
        <ThemedText style={[styles.statsTitle, { color: theme.primary }]}>Yearly Stats</ThemedText>
        <View style={styles.statsGrid}>
          <View style={styles.statsGridRow}>
            <View style={styles.statsGridItem}>
              <ThemedText style={[styles.statsValue, { color: theme.text }]}>{stats.numLogs}</ThemedText>
              <ThemedText style={[styles.statsLabel, { color: theme.text + '99' }]}>Logs</ThemedText>
            </View>
            <View style={styles.statsGridItem}>
              <ThemedText style={[styles.statsValue, { color: theme.text }]}>{stats.totalHours}</ThemedText>
              <ThemedText style={[styles.statsLabel, { color: theme.text + '99' }]}>Hours Travelling</ThemedText>
            </View>
          </View>
          <View style={styles.statsGridRow}>
            <View style={styles.statsGridItem}>
              <ThemedText style={[styles.statsValue, { color: theme.text }]}>{stats.avgCrew}</ThemedText>
              <ThemedText style={[styles.statsLabel, { color: theme.text + '99' }]}>Avg. Crew</ThemedText>
            </View>
            <View style={styles.statsGridItem}>
              <ThemedText style={[styles.statsValue, { color: theme.text }]}>{stats.totalDistanceNm}</ThemedText>
              <ThemedText style={[styles.statsLabel, { color: theme.text + '99' }]}>Distance (nm)</ThemedText>
            </View>
          </View>
          <View style={styles.statsGridRow}>
            <View style={styles.statsGridItem}>
              <ThemedText style={[styles.statsValue, { color: theme.text }]}>{stats.longestHours}</ThemedText>
              <ThemedText style={[styles.statsLabel, { color: theme.text + '99' }]}>Longest Trip</ThemedText>
            </View>
            <View style={styles.statsGridItem}>
              <ThemedText style={[styles.statsValue, { color: theme.text }]}>{stats.shortestHours}</ThemedText>
              <ThemedText style={[styles.statsLabel, { color: theme.text + '99' }]}>Shortest Trip</ThemedText>
            </View>
          </View>
        </View>
      </ThemedView>
      {renderLogSelectionModal()}
      {selectedLog && (
        <LogDetailModal
          modalVisibility={isDetailModalVisible}
          setModalVisibility={setDetailModalVisible}
          log={selectedLog}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsCardFixed: {
    width: "98%",
    alignSelf: 'center',
    borderRadius: 16,
    padding: 14,
    marginTop: 4,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    borderWidth: 1,
    justifyContent: 'flex-start',
    minHeight: SCREEN_HEIGHT * 0.22,
    maxHeight: SCREEN_HEIGHT * 0.35,
  },
  flexFill: {
    flex: 1,
    minHeight: SCREEN_HEIGHT,
    width: '100%',
  },
  flexGrow: {
    minHeight: SCREEN_HEIGHT * 0.28,
    maxHeight: SCREEN_HEIGHT * 0.32,
    justifyContent: 'flex-start',
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
    borderRadius: 0,
  },
  calendarHeaderTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E66E7",
    width: undefined,
    alignSelf: 'stretch'
  },
  calendar: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 8,
    marginTop: 2,
    minHeight: SCREEN_HEIGHT * 0.28,
    maxHeight: SCREEN_HEIGHT * 0.32,
  },
  statsCardExpanded: {
    flex: 1,
    width: "98%",
    alignSelf: 'stretch',
    borderRadius: 16,
    padding: 14,
    marginTop: 4,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    borderWidth: 1,
    justifyContent: 'flex-start',
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
