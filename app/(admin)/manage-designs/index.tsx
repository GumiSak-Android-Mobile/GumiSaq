// app/(admin)/manage-designs/index.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';

import ManageColors from '@/components/ManageColors';
import ManageStickers from '@/components/ManageStickers';
import ManageFonts from '@/components/ManageFonts';

type ActiveTab = 'colors' | 'stickers' | 'fonts';

const ManageDesignsScreen = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('colors');

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-4 bg-white shadow-sm">
        <Text className="text-2xl font-bold text-gray-900">Kelola Aset Desain</Text>
      </View>

      {/* Tab Switcher */}
      <View className="flex-row justify-around bg-white p-2">
        <TabButton title="Warna" isActive={activeTab === 'colors'} onPress={() => setActiveTab('colors')} />
        <TabButton title="Stiker" isActive={activeTab === 'stickers'} onPress={() => setActiveTab('stickers')} />
        <TabButton title="Font" isActive={activeTab === 'fonts'} onPress={() => setActiveTab('fonts')} />
      </View>
      
      {/* HAPUS ScrollView dari sini */}
      <View className="flex-1">
        {activeTab === 'colors' && <ManageColors />}
        {activeTab === 'stickers' && <ManageStickers />}
        {activeTab === 'fonts' && <ManageFonts />}
      </View>
      {/* HAPUS ScrollView sampai sini */}

    </SafeAreaView>
  );
};

const TabButton = ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void; }) => (
    <TouchableOpacity onPress={onPress} className={`py-2 px-6 rounded-full ${isActive ? 'bg-primary-500' : 'bg-gray-200'}`}>
        <Text className={`font-semibold ${isActive ? 'text-white' : 'text-gray-700'}`}>{title}</Text>
    </TouchableOpacity>
);

export default ManageDesignsScreen;