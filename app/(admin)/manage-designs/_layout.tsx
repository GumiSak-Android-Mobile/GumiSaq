
import { Stack } from 'expo-router';
import React from 'react';

const DesignManagementLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* Tambahkan screen untuk create/edit jika diperlukan nanti */}
    </Stack>
  );
};

export default DesignManagementLayout;