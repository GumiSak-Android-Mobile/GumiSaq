// app/(admin)/manage-scanner/_layout.tsx

import { Stack } from 'expo-router';
import React from 'react';

const ScannerLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index" // merujuk ke index.tsx
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create" // merujuk ke create.tsx
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]" // merujuk ke [id].tsx
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
};

export default ScannerLayout;
