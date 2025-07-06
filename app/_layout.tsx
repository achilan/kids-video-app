import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";

import { initDB } from "@/database/db";
import AdminScreen from "@/screens/AdminScreen";
import HomeScreen from "@/screens/HomeScreen";
import ParentalLockScreen from "@/screens/ParentalLockScreen";
import VideoPlayerScreen from "@/screens/VideoPlayerScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Player" component={VideoPlayerScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminScreen" component={AdminScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ParentalLock" component={ParentalLockScreen} options={{ title: "Código" }} />
    </Stack.Navigator>
  );
}

export default function RootLayout() {
  useEffect(() => {
    initDB().then(() => console.log("DB lista")).catch(console.log);
  }, []);

  return (
    <PaperProvider>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: "#121212", // negro total
              height: 70,
              paddingBottom: 10,
              borderTopWidth: 0.5,
              borderColor: "#333",
            },
            tabBarLabelStyle: {
              fontSize: 14,
              fontWeight: "bold",
            },
            tabBarIcon: ({ color }) => {
              let iconName;
              if (route.name === "Videos") iconName = "home";
              else if (route.name === "Admin") iconName = "lock-closed";
              return <Ionicons name={iconName as any} size={28} color={color} />;
            },
            tabBarActiveTintColor: "#FF0000", // rojo YouTube
            tabBarInactiveTintColor: "#888",   // gris suave
          })}
        >
          <Tab.Screen name="Videos" component={HomeStack} />
          <Tab.Screen name="Admin" component={AdminStack} />
        </Tab.Navigator>
        <StatusBar style="light" />
    </PaperProvider>
  );
}