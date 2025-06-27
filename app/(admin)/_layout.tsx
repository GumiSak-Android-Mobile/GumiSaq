// app/(admin)/_layout.tsx

import { Tabs } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const TabIcon = ({
  iconName,
  color,
  focused,
  title,
}: {
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
  title: string;
}) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      <Ionicons name={iconName} size={24} color={color} />
      <Text
        style={{ color: color, fontSize: 12, fontWeight: focused ? '600' : '400' }}
      >
        {title}
      </Text>
    </View>
  );
};

const AdminTabLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#0BBEBB',
          tabBarInactiveTintColor: '#666876',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            height: 84,
            paddingBottom: 10,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName={focused ? 'grid' : 'grid-outline'}
                color={color}
                focused={focused}
                title="Dashboard"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="manage-articles"
          options={{
            title: 'Artikel',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName={
                  focused ? 'document-text' : 'document-text-outline'
                }
                color={color}
                focused={focused}
                title="Artikel"
              />
            ),
          }}
        />
        {/* TAB BARU UNTUK SCANNER */}
        <Tabs.Screen
          name="manage-scanner"
          options={{
            title: 'Scanner',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                iconName={focused ? 'scan' : 'scan-outline'}
                color={color}
                focused={focused}
                title="Scanner"
              />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
};

export default AdminTabLayout;