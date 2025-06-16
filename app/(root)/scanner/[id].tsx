import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

export default function VideoFromQRScreen() {
  const { id } = useLocalSearchParams();
  const decodedUrl = decodeURIComponent(id as string);

  const isValidUrl = decodedUrl.startsWith('http://') || decodedUrl.startsWith('https://');

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Tonton Video' }} />
      <Text style={styles.title}>Video dari QR Code</Text>

      {isValidUrl ? (
        <WebView
          source={{ uri: decodedUrl }}
          style={styles.webview}
          allowsFullscreenVideo
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
          )}
        />
      ) : (
        <Text style={styles.errorText}>QR Code tidak berisi URL yang valid.</Text>
      )}

      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Pindai QR Code Lain</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  webview: {
    width: width * 0.95,
    height: height * 0.6,
    backgroundColor: 'black',
    borderRadius: 10,
    overflow: 'hidden',
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 30,
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
