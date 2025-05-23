import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { FriendRequestDTO, FriendUserDTO, FriendsLogDTO } from "../../interfaces/friends/friends";
import { useFriendsFeed } from "@/hooks/useFriends";

export default function FeedScreen() {
  const { feed, isLoading } = useFriendsFeed();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Friends' Latest Logs</Text>
      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={feed}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.logCard}>
              <Text style={styles.logTitle}>{item.user.name || item.user.email}</Text>
              <Text>{item.description}</Text>
              <Text>
                {item.boat.name} ({item.boat.model})
              </Text>
              <Text>
                {new Date(item.log_started).toLocaleString()} - {new Date(item.log_ended).toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontWeight: "bold", fontSize: 18, marginBottom: 12 },
  logCard: { backgroundColor: "#f8f8f8", borderRadius: 8, padding: 12, marginBottom: 12 },
  logTitle: { fontWeight: "bold", fontSize: 16 },
});
