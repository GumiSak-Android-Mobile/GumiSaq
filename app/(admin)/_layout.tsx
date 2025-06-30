import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const AdminTabLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#0BBEBB',
          tabBarInactiveTintColor: '#666876',
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons 
                name={focused ? 'grid' : 'grid-outline'} 
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="manage-articles"
          options={{
            title: 'Artikel',
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons 
                name={focused ? 'document-text' : 'document-text-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="manage-scanner"
          options={{
            title: 'Scanner',
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name={focused ? 'scan' : 'scan-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />
      <Tabs.Screen
        name="manage-designs" // Sekarang ini akan merujuk ke grup yang sudah punya layout sendiri
        options={{
          title: 'Desain', // Ganti judul agar lebih deskriptif
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? 'color-palette' : 'color-palette-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      </Tabs>
    </GestureHandlerRootView>
  );
};

export default AdminTabLayout;