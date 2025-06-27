// app/(admin)/manage-scanner/_layout.tsx

import { Stack } from 'expo-router';
import React from 'react';

const ScannerLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default ScannerLayout;