import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import dayjs from 'dayjs';
import { LogDTO } from '@/interfaces/log/log';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface LogRouteMapWithReplayProps {
  log: LogDTO;
  height?: number;
  showReplayControls?: boolean;
  onMapPress?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SPEEDS = [0.5, 1, 1.5, 2, 5, 10, 20, 50];

const LogRouteMapWithReplay: React.FC<LogRouteMapWithReplayProps> = ({ log, height = 200, showReplayControls = true, onMapPress }) => {
  const { theme, isDark } = useTheme();
  const [replayIndex, setReplayIndex] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [mapRegion, setMapRegion] = useState<any>(undefined);
  const [isFollowing, setIsFollowing] = useState(true);
  const [replayProgress, setReplayProgress] = useState(0); // floating point progress
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    setReplayIndex(0);
    setReplayProgress(0);
    setIsReplaying(false);
  }, [log]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const TICK_MS = 3;
    if (isReplaying && log?.coordinates?.length > 1) {
      interval = setInterval(() => {
        setReplayProgress((prev) => {
          const next = prev + speed * (TICK_MS / 1000); // speed is in points/sec
          if (next >= log.coordinates.length - 1) {
            setIsReplaying(false);
            return 0;
          }
          return next;
        });
      }, TICK_MS);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isReplaying, log, speed]);

  // Keep replayIndex in sync with replayProgress
  useEffect(() => {
    if (log?.coordinates?.length > 1) {
      const idx = Math.floor(replayProgress);
      setReplayIndex(Math.min(idx, log.coordinates.length - 1));
    }
  }, [replayProgress, log]);

  // Clamp replayIndex and replayProgress to valid range
  const clampIndex = (idx: number) => {
    if (!log?.coordinates?.length) return 0;
    return Math.max(0, Math.min(idx, log.coordinates.length - 1));
  };

  // When user drags slider, update both replayIndex and replayProgress (clamped)
  const handleSliderChange = (val: number) => {
    const clamped = clampIndex(Math.round(val));
    setReplayIndex(clamped);
    setReplayProgress(clamped);
    setIsReplaying(false);
  };

  // When replay starts, follow pin
  useEffect(() => {
    if (isReplaying) setIsFollowing(true);
  }, [isReplaying]);

  // Follow pin as replayIndex changes, unless user has panned/zoomed
  useEffect(() => {
    if (
      isFollowing &&
      log?.coordinates?.length > 0 &&
      mapRef.current
    ) {
      const coord = log.coordinates[clampIndex(replayIndex)];
      if (coord) {
        mapRef.current.animateToRegion({
          latitude: coord.latitude,
          longitude: coord.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 350);
      }
    }
  }, [replayIndex, isFollowing, log]);

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
        <View style={[styles.mapContainer, { height, backgroundColor: theme.card }]}> 
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
            onRegionChangeComplete={region => {
              setMapRegion(region);
            }}
            onPanDrag={() => setIsFollowing(false)}
            onTouchStart={() => setIsFollowing(false)}
          >
            <Polyline
              coordinates={log?.coordinates || []}
              strokeWidth={7}
              strokeColor={theme.primary}
              lineCap="round"
              lineJoin="round"
              zIndex={10}
            />
            <Polyline
              coordinates={log?.coordinates || []}
              strokeWidth={11}
              strokeColor={isDark ? theme.background : '#fff'}
              lineCap="round"
              lineJoin="round"
              zIndex={5}
            />
            {log?.coordinates?.length > 0 && log.coordinates[clampIndex(replayIndex)] && (
              <Marker
                coordinate={log.coordinates[clampIndex(replayIndex)]}
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
            style={[styles.recenterBtn, { backgroundColor: theme.background }]}
            onPress={() => {
              if (log?.coordinates?.length > 0 && mapRef.current) {
                const coord = log.coordinates[clampIndex(replayIndex)];
                if (coord) {
                  setIsFollowing(true);
                  mapRef.current.animateToRegion({
                    latitude: coord.latitude,
                    longitude: coord.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  });
                }
              }
            }}
            accessibilityLabel="Recenter on current log location"
          >
            <Ionicons name="locate" size={22} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      {showReplayControls && (
        <View style={{ marginTop: 8 }}>
          {/* Slider for timeline with play/pause to the left */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={[
                styles.playPauseButton,
                { backgroundColor: isDark ? theme.primary : '#2E66E7' },
                { marginRight: 8, borderRadius: 16, padding: 6, minWidth: 28, minHeight: 28, marginLeft: 4 },
              ]}
              onPress={() => {
                if (isReplaying) {
                  setIsReplaying(false);
                } else {
                  if (replayIndex >= log.coordinates.length - 1) setReplayIndex(0);
                  setIsFollowing(true);
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
              onValueChange={handleSliderChange}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={isDark ? theme.card : '#eaf0fa'}
              thumbTintColor={theme.primary}
              disabled={!log?.coordinates?.length}
            />
            {/* Speed and replay controls to the right */}
            <TouchableOpacity
              style={[
                styles.speedBtn,
                { backgroundColor: isDark ? theme.card : '#eee' },
                { minWidth: 60, minHeight: 40, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
              ]}
              onPress={() => {
                const idx = SPEEDS.indexOf(speed);
                setSpeed(SPEEDS[(idx + 1) % SPEEDS.length]);
              }}
              disabled={!log?.coordinates?.length}
              accessibilityLabel={`Change replay speed (current: ${speed}x)`}
            >
              <Text style={[styles.speedBtnText, { color: theme.primary }]}>{speed}x</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.replayButton,
                { backgroundColor: isDark ? theme.card : '#eaf0fa' },
                { minWidth: 44, minHeight: 40, alignItems: 'center', justifyContent: 'center', marginLeft: 4, marginRight: 8 }, // Add marginRight
              ]}
              onPress={() => {
                setReplayIndex(0);
                setReplayProgress(0);
                setIsReplaying(false);
              }}
              disabled={!log?.coordinates?.length}
              accessibilityLabel="Replay from start"
            >
              <Text style={[styles.replayIcon, { color: theme.primary }]}>⟲</Text>
            </TouchableOpacity>
          </View>
          {/* Progress info */}
          <Text style={[styles.replayProgress, { color: theme.primary }]}>
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
    bottom: 10, // move to bottom
    left: 10,   // move to left
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
