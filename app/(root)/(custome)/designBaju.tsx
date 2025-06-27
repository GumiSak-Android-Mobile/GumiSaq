// TemplateScreen.js (modifikasi bagian navigasi)
import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import {
  ArrowLeftIcon,
  BellIcon,
  HeartIcon,
  HomeIcon,
  ShoppingCartIcon,
  UserIcon,
} from 'react-native-heroicons/outline';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const colorMap: { [key: string]: string } = {
  'Black': '#000000',
  'Blue': '#0000FF',
  'Dark Green': '#006400',
  'Cream': '#F5F5DC',
  'Light Green': '#90EE90',
  'Red': '#FF0000',
  'White': '#CCCCCC',
  'Pink': '#FFC0CB',
  'Navy': '#000080',
  'Grey': '#808080',
  'Royal Blue': '#4169E1',
  'Teal': '#008080',
};

export default function TemplateScreen() {
  const router = useRouter();

  const tShirts = [
    { color: 'Black' },
    { color: 'Blue' },
    { color: 'Dark Green' },
    { color: 'Cream' },
    { color: 'Light Green' },
    { color: 'Red' },
    { color: 'White' },
    { color: 'Pink' },
    { color: 'Navy' },
    { color: 'Grey' },
    { color: 'Royal Blue' },
    { color: 'Teal' },
    { color: 'Black' },
    { color: 'Blue' },
    { color: 'Dark Green' },
    { color: 'Cream' },
    { color: 'Light Green' },
    { color: 'Red' },
    { color: 'White' },
    { color: 'Pink' },
    { color: 'Navy' },
    { color: 'Grey' },
    { color: 'Royal Blue' },
    { color: 'Teal' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#4F6D55" />

      {/* Header */}
      <View className="flex-row items-center p-4 bg-[#4F6D55]">
        <TouchableOpacity className="mr-4" onPress={() => router.back()}>
          <ArrowLeftIcon size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">GumisaQ Design Studio</Text>
      </View>

      {/* Grid T-Shirts */}
      <ScrollView className="flex-1 px-3 py-4 bg-white">
        <View className="flex-row flex-wrap justify-between">
          {tShirts.map((tShirt, index) => (
            <TouchableOpacity
              key={index}
              className="w-[30%] bg-gray-100 rounded-lg mb-4 items-center justify-center shadow"
              style={{ aspectRatio: 0.75, padding: 10 }}
              onPress={() => router.push({
                pathname: '/custome1',
                params: { selectedColor: tShirt.color }
              })}
            >
              <MaterialCommunityIcons
                name="tshirt-v"
                size={48}
                color={colorMap[tShirt.color] || '#000'}
              />
              <Text className="text-gray-800 text-sm font-semibold text-center mt-2">
                {tShirt.color}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}