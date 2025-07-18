import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import dayjs from 'dayjs';
import { LogDTO } from '@/interfaces/log/log';

interface LogRouteMapWithReplayProps {
  log: LogDTO;
  height?: number;
  showReplayControls?: boolean;
  onMapPress?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LogRouteMapWithReplay: React.FC<LogRouteMapWithReplayProps> = ({ log, height = 200, showReplayControls = true, onMapPress }) => {
  const [replayIndex, setReplayIndex] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);

  useEffect(() => {
    setReplayIndex(0);
    setIsReplaying(false);
  }, [log]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isReplaying && log?.coordinates?.length > 1) {
      interval = setInterval(() => {
        setReplayIndex((prev) => {
          if (prev < log.coordinates.length - 1) {
            return prev + 1;
          } else {
            setIsReplaying(false);
            return prev;
          }
        });
      }, 10);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReplaying, log]);

  function formatDuration(seconds: number) {
    if (isNaN(seconds) || seconds < 0) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h ? `${h}h` : '', m ? `${m}m` : '', `${s}s`].filter(Boolean).join(' ');
  }

  const getCurrentPointTime = () => {
    if (!log?.coordinates?.length || !log.log_started || isNaN(new Date(log.log_started).getTime()))
      return '0s';
    const currCoord = log.coordinates[replayIndex];
    if (currCoord?.timestamp) {
      const start = new Date(log.log_started).getTime();
      const curr = new Date(currCoord.timestamp).getTime();
      if (!isNaN(curr) && !isNaN(start)) {
        const elapsedSec = Math.max(0, Math.round((curr - start) / 1000));
        return formatDuration(elapsedSec);
      }
    }
    const totalPoints = log.coordinates.length;
    const totalDuration =
      log.log_started && log.log_ended
        ? new Date(log.log_ended).getTime() - new Date(log.log_started).getTime()
        : 0;
    if (totalPoints > 1 && totalDuration > 0) {
      const elapsedMs = Math.round((replayIndex / (totalPoints - 1)) * totalDuration);
      return formatDuration(Math.max(0, Math.round(elapsedMs / 1000)));
    }
    return '0s';
  };

  const getTotalDuration = () => {
    if (!log?.log_started || !log?.log_ended) return '0s';
    const start = new Date(log.log_started).getTime();
    const end = new Date(log.log_ended).getTime();
    if (isNaN(start) || isNaN(end) || end < start) return '0s';
    const elapsedSec = Math.round((end - start) / 1000);
    return formatDuration(elapsedSec);
  };

  const getCurrentPointTimestamp = () => {
    if (!log?.coordinates?.length) return '';
    const curr = log.coordinates[replayIndex]?.timestamp;
    if (curr) {
      const date = dayjs(curr);
      if (date.isValid()) {
        return date.format('YYYY-MM-DD HH:mm');
      }
    }
    return '';
  };

  return (
    <View style={{ marginBottom: 8 }}>
      <TouchableOpacity activeOpacity={onMapPress ? 0.7 : 1} onPress={onMapPress} disabled={!onMapPress}>
        <View style={[styles.mapContainer, { height }]}> 
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: log?.coordinates?.[0]?.latitude || 37.78825,
              longitude: log?.coordinates?.[0]?.longitude || -122.4324,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Polyline
              coordinates={log?.coordinates || []}
              strokeWidth={7}
              strokeColor="#2E66E7"
              lineCap="round"
              lineJoin="round"
              zIndex={10}
            />
            <Polyline
              coordinates={log?.coordinates || []}
              strokeWidth={11}
              strokeColor="#fff"
              lineCap="round"
              lineJoin="round"
              zIndex={5}
            />
            {log?.coordinates?.length > 0 && (
              <Marker
                coordinate={log.coordinates[replayIndex]}
                pinColor="#E74C3C"
                title="Current Position"
                description={
                  getCurrentPointTimestamp()
                    ? `Time: ${getCurrentPointTimestamp()}`
                    : `Elapsed: ${getCurrentPointTime()}`
                }
              />
            )}
          </MapView>
        </View>
      </TouchableOpacity>
      {showReplayControls && (
        <View style={styles.replayControls}>
          {!isReplaying ? (
            <TouchableOpacity
              style={styles.replayButton}
              onPress={() => {
                setReplayIndex(0);
                setIsReplaying(true);
              }}
              disabled={!log?.coordinates?.length}
            >
              <Text style={styles.replayButtonText}>Replay Trip</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.replayButton, styles.replayButtonActive]}
              onPress={() => {
                setIsReplaying(false);
              }}
            >
              <Text style={styles.replayButtonText}>Stop Replay</Text>
            </TouchableOpacity>
          )}
          {isReplaying && (
            <Text style={styles.replayProgress}>
              Elapsed: {getCurrentPointTime()} / {getTotalDuration()}
              {getCurrentPointTimestamp() ? ` (${getCurrentPointTimestamp()})` : ''}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    minHeight: 120,
    maxHeight: 350,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#eaf0fa',
    marginBottom: 4,
  },
  map: {
    flex: 1,
    borderRadius: 10,
    width: '100%',
    height: '100%',
  },
  replayControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  replayButton: {
    backgroundColor: '#2E66E7',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  replayButtonActive: {
    backgroundColor: '#aaa',
  },
  replayButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  replayProgress: {
    marginLeft: 12,
    color: '#2E66E7',
    fontWeight: '600',
    fontSize: SCREEN_WIDTH > 400 ? 15 : 13,
  },
});

export default LogRouteMapWithReplay;
