import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import dayjs from 'dayjs';
import { LogDTO } from '@/interfaces/log/log';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

interface LogRouteMapWithReplayProps {
  log: LogDTO;
  height?: number;
  showReplayControls?: boolean;
  onMapPress?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SPEEDS = [0.5, 1, 1.5, 2, 5, 10];

const LogRouteMapWithReplay: React.FC<LogRouteMapWithReplayProps> = ({ log, height = 200, showReplayControls = true, onMapPress }) => {
  const [replayIndex, setReplayIndex] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [mapRegion, setMapRegion] = useState<any>(undefined);
  const mapRef = useRef<MapView | null>(null);

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
            // Loop back to start
            return 0;
          }
        });
      }, Math.max(10, 100 / speed));
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReplaying, log, speed]);

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
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: log?.coordinates?.[0]?.latitude || 37.78825,
              longitude: log?.coordinates?.[0]?.longitude || -122.4324,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            region={mapRegion}
            onRegionChangeComplete={region => setMapRegion(region)}
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
          {/* Recenter button */}
          <TouchableOpacity
            style={styles.recenterBtn}
            onPress={() => {
              if (log?.coordinates?.length > 0 && mapRef.current) {
                mapRef.current.animateToRegion({
                  latitude: log.coordinates[replayIndex].latitude,
                  longitude: log.coordinates[replayIndex].longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                });
              }
            }}
            accessibilityLabel="Recenter on current log location"
          >
            <Ionicons name="locate" size={22} color="#2E66E7" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      {showReplayControls && (
        <View style={{ marginTop: 8 }}>
          {/* Slider for timeline with play/pause to the left */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={[styles.playPauseButton, isReplaying ? styles.pauseButton : styles.playButton, { marginRight: 8, borderRadius: 16, padding: 6, minWidth: 28, minHeight: 28, marginLeft: 4 }]}
              onPress={() => {
                if (isReplaying) {
                  setIsReplaying(false);
                } else {
                  if (replayIndex >= log.coordinates.length - 1) setReplayIndex(0);
                  setIsReplaying(true);
                }
              }}
              disabled={!log?.coordinates?.length}
            >
              <Ionicons name={isReplaying ? 'pause' : 'play'} size={16} color="#fff" />
            </TouchableOpacity>
            <Slider
              style={{ flex: 1, height: 24 }}
              minimumValue={0}
              maximumValue={log?.coordinates?.length ? log.coordinates.length - 1 : 0}
              value={replayIndex}
              onValueChange={val => setReplayIndex(Math.round(val))}
              minimumTrackTintColor="#2E66E7"
              maximumTrackTintColor="#eaf0fa"
              thumbTintColor="#2E66E7"
              disabled={!log?.coordinates?.length}
            />
            {/* Speed and replay controls to the right */}
            <TouchableOpacity
              style={[styles.speedBtn, { minWidth: 60, minHeight: 40, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }]} 
              onPress={() => {
                const idx = SPEEDS.indexOf(speed);
                setSpeed(SPEEDS[(idx + 1) % SPEEDS.length]);
              }}
              disabled={!log?.coordinates?.length}
              accessibilityLabel={`Change replay speed (current: ${speed}x)`}
            >
              <Text style={styles.speedBtnText}>{speed}x</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.replayButton, { minWidth: 44, minHeight: 40, alignItems: 'center', justifyContent: 'center', marginLeft: 4 }]} 
              onPress={() => {
                setReplayIndex(0);
                setIsReplaying(false);
              }}
              disabled={!log?.coordinates?.length}
              accessibilityLabel="Replay from start"
            >
              <Text style={styles.replayIcon}>⟲</Text>
            </TouchableOpacity>
          </View>
          {/* Progress info */}
          <Text style={styles.replayProgress}>
            Elapsed: {getCurrentPointTime()} / {getTotalDuration()}
            {getCurrentPointTimestamp() ? ` (${getCurrentPointTimestamp()})` : ''}
          </Text>
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
  replayControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
    gap: 8,
  },
  replayButton: {
    marginLeft: 8,
    backgroundColor: '#eaf0fa',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 40,
  },
  replayIcon: {
    fontSize: 20,
    color: '#2E66E7',
    fontWeight: 'bold',
  },
  playPauseButton: {
    backgroundColor: '#2E66E7',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 8,
  },
  playButton: {
    backgroundColor: '#2E66E7',
  },
  pauseButton: {
    backgroundColor: '#aaa',
  },
  playPauseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  speedBtn: {
    backgroundColor: '#eee',
    color: '#2E66E7',
    fontWeight: 'bold',
    fontSize: 15,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    minHeight: 40,
  },
  speedBtnText: {
    color: '#2E66E7',
    fontWeight: 'bold',
    fontSize: 15,
  },
  replayProgress: {
    marginLeft: 12,
    color: '#2E66E7',
    fontWeight: '600',
    fontSize: SCREEN_WIDTH > 400 ? 15 : 13,
  },
  recenterBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 7,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    zIndex: 20,
  },
});

export default LogRouteMapWithReplay;
