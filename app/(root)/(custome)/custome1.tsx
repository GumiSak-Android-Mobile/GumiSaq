import { DesignElement } from "@/constants/article";
import images from '@/constants/images';
// Import semua family ikon yang ingin Anda gunakan (pastikan Ionicons terinstal jika digunakan)
import { FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Import ImagePicker sebagai namespace
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState, useCallback } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ViewStyle,
  TextInput, // Perlu untuk input URL stiker
} from 'react-native';
import { ArrowLeftIcon, ArrowUturnLeftIcon, TrashIcon } from 'react-native-heroicons/outline';
import { captureRef } from 'react-native-view-shot';

import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  // withSpring, // Tidak digunakan
  // withTiming, // Tidak digunakan
  runOnJS,
  // SharedValue, // Tidak perlu diimpor di sini, karena sudah diimport oleh useSharedValue
} from 'react-native-reanimated';


const { width, height } = Dimensions.get('window');

const colorMap: { [key: string]: string } = {
  'Black': '#000000',
  'Blue': '#0000FF',
  'Dark Green': '#006400',
  'Cream': '#F5F5DC',
  'Light Green': '#90EE90',
  'Red': '#FF0000',
  'White': '#FFFFFF',
  'Pink': '#FFC0CB',
  'Navy': '#000080',
  'Grey': '#808080',
  'Royal Blue': '#4169E1',
  'Teal': '#008080',
};

// =======================================================================
// KOMPONEN: DraggableResizableElement
// Tanggung jawab: Merender elemen desain dan menangani gestur interaksi
// =======================================================================
interface DraggableResizableElementProps {
  element: DesignElement;
  onUpdateElement: (updatedElement: DesignElement) => void;
  containerWidth: number;
  containerHeight: number;
}

const DraggableResizableElement: React.FC<DraggableResizableElementProps> = ({
  element,
  onUpdateElement,
  containerWidth,
  containerHeight,
}) => {
  // Pastikan inisialisasi dengan nilai dari element. DesignElement harus menjamin
  // scale dan rotation adalah number. Jika DesignElement mengizinkan undefined,
  // maka gunakan fallback || 1 atau || 0.
  const translateX = useSharedValue(element.x);
  const translateY = useSharedValue(element.y);
  const scale = useSharedValue(element.scale || 1); // Asumsi element.scale adalah number
  const rotation = useSharedValue(element.rotation ||0); // Asumsi element.rotation adalah number

  const startTranslateX = useSharedValue(element.x);
  const startTranslateY = useSharedValue(element.y);
  const startScale = useSharedValue(element.scale || 1);
  const startRotation = useSharedValue(element.rotation || 0);

  // Fungsi utilitas untuk mendapatkan ukuran dasar elemen (sebelum scaling)
  const getBaseElementDimensions = useCallback(() => {
    switch (element.type) {
      case 'image':
      case 'sticker':
        return { width: 100, height: 100 }; // Ukuran dasar untuk gambar/stiker
      case 'icon':
        return { width: element.iconSize || 50, height: element.iconSize || 50 }; // Ukuran dasar untuk ikon
      case 'text':
        // Estimasi kasar untuk teks. Untuk akurasi, memerlukan pengukuran teks.
        const estimatedTextWidth = (element.fontSize || 16) * (element.text?.length || 1) * 0.6;
        const estimatedTextHeight = element.fontSize || 16;
        return { width: Math.max(estimatedTextWidth, 20), height: Math.max(estimatedTextHeight, 20) };
      default:
        return { width: 100, height: 100 }; // Fallback jika tipe tidak dikenal
    }
  }, [element]);

  // Gestur untuk Panning (Drag)
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startTranslateX.value = translateX.value;
      startTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      const { width: baseWidth, height: baseHeight } = getBaseElementDimensions();
      const currentElementWidth = baseWidth * scale.value;
      const currentElementHeight = baseHeight * scale.value;

      let newX = startTranslateX.value + event.translationX;
      let newY = startTranslateY.value + event.translationY;

      // Batasi pergerakan agar elemen tidak keluar dari container
      newX = Math.max(0, Math.min(newX, containerWidth - currentElementWidth));
      newY = Math.max(0, Math.min(newY, containerHeight - currentElementHeight));

      translateX.value = newX;
      translateY.value = newY;
    })
    .onEnd(() => {
      // Perbarui state di komponen induk setelah gestur selesai
      runOnJS(onUpdateElement)({
        ...element,
        x: translateX.value,
        y: translateY.value,
      });
    });

  // Gestur untuk Pinch (Scaling)
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = startScale.value * event.scale;
    })
    .onEnd(() => {
      runOnJS(onUpdateElement)({
        ...element,
        scale: scale.value,
      });
    });

  // Gestur untuk Rotation
  const rotateGesture = Gesture.Rotation()
    .onStart(() => {
      startRotation.value = rotation.value;
    })
    .onUpdate((event) => {
      rotation.value = startRotation.value + event.rotation;
    })
    .onEnd(() => {
      runOnJS(onUpdateElement)({
        ...element,
        rotation: rotation.value,
      });
    });

  // Gabungkan semua gestur agar bisa dilakukan bersamaan
  const combinedGesture = Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    rotateGesture
  );

  // Gaya animasi yang diterapkan pada Animated.View
  const animatedStyle = useAnimatedStyle<ViewStyle>(() => {
    return {
      position: 'absolute',
      left: translateX.value,
      top: translateY.value,
      transform: [
        { scale: scale.value },
        { rotateZ: `${rotation.value}rad` },
      ],
    };
  });

  // Fungsi untuk merender konten elemen sesuai tipenya
  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <Text style={{ color: element.textColor, fontSize: element.fontSize, fontWeight: 'bold' }}>
            {element.text}
          </Text>
        );
      case 'image':
      case 'sticker':
        return (
          <Image
            source={{ uri: element.imageUri }}
            style={{ width: 100, height: 100, resizeMode: 'contain' }}
          />
        );
      case 'icon':
        // Memilih komponen ikon yang benar berdasarkan family
        const IconComponent = (() => {
          switch (element.iconFamily) {
            case 'FontAwesome': return FontAwesome;
            case 'MaterialCommunityIcons': return MaterialCommunityIcons;
            case 'Ionicons': return Ionicons;
            default: return FontAwesome; // Default fallback
          }
        })();
        return (
          <IconComponent
            name={element.iconName as any || 'question-circle'}
            size={element.iconSize || 50}
            color={element.iconColor || 'black'}
          />
        );
      default:
        return null;
    }
  };

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View style={animatedStyle}>
        {renderContent()}
      </Animated.View>
    </GestureDetector>
  );
};
// =======================================================================
// AKHIR KOMPONEN: DraggableResizableElement
// =======================================================================


export default function DesignScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const designAreaRef = useRef<View>(null);

  const initialColor: string = Array.isArray(params.selectedColor)
    ? params.selectedColor[0]
    : (params.selectedColor || 'White');
  const [currentTshirtColor, setCurrentTshirtColor] = useState<string>(initialColor);
  const displayColor = colorMap[currentTshirtColor] || '#FFFFFF';

  const [designElements, setDesignElements] = useState<DesignElement[]>([]);
  const [history, setHistory] = useState<DesignElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);

  // Deklarasi state yang diperlukan untuk modal stiker/ikon (ini yang perlu dijamin ada di sini)
  const [isStickerPickerVisible, setIsStickerPickerVisible] = useState(false);
  const [selectedIconFamily, setSelectedIconFamily] = useState<'FontAwesome' | 'MaterialCommunityIcons' | 'Ionicons'>('FontAwesome');
  const [stickerImageUrlInput, setStickerImageUrlInput] = useState<string>('');


  const [designAreaLayout, setDesignAreaLayout] = useState({ width: 0, height: 0 });

  // Fungsi untuk menambah history
  const addHistory = useCallback((newElements: DesignElement[]) => {
    if (historyIndex > 0 && JSON.stringify(history[historyIndex]) === JSON.stringify(newElements)) {
      return;
    }
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setDesignElements(history[historyIndex - 1]);
    } else {
      Alert.alert("Info", "Tidak ada riwayat untuk diurungkan.");
    }
  };

  const deleteSelectedElement = () => {
    if (designElements.length > 0) {
      Alert.alert(
        "Hapus Elemen",
        "Apakah Anda yakin ingin menghapus elemen terakhir?",
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Hapus",
            onPress: () => {
              const newElements = designElements.slice(0, -1);
              setDesignElements(newElements);
              addHistory(newElements);
            },
            style: "destructive",
          },
        ]
      );
    } else {
      Alert.alert("Info", "Tidak ada elemen untuk dihapus.");
    }
  };

  // Fungsi untuk memilih gambar dari galeri
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      // Menggunakan ImagePicker.MediaType.Images adalah cara modern yang benar.
      // JIKA MASIH ERROR: 'Property 'MediaType' does not exist...',
      // maka itu masalah versi expo-image-picker Anda.
      // Anda harus mengupdate expo-image-picker: `npx expo install expo-image-picker`
      // ATAU secara sementara, ganti baris di bawah ini dengan:
      // mediaTypes: ImagePicker.MediaTypeOptions.Images, // Ini akan menimbulkan warning
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImageElement: DesignElement = {
        id: `image-${Date.now()}`,
        type: 'image',
        x: designAreaLayout.width / 2 - 50,
        y: designAreaLayout.height / 2 - 50,
        imageUri: result.assets[0].uri,
        scale: 0.5,
        rotation: 0,
      };
      const newElements = [...designElements, newImageElement];
      setDesignElements(newElements);
      addHistory(newElements);
    }
  };

  // Fungsi untuk menambahkan ikon (dari modal)
  const handleAddIcon = (iconName: string, iconFamily: DesignElement['iconFamily']) => {
    const defaultIconSize = 50;
    const newIconElement: DesignElement = {
      id: `icon-${Date.now()}`,
      type: 'icon',
      x: designAreaLayout.width / 2 - (defaultIconSize / 2),
      y: designAreaLayout.height / 2 - (defaultIconSize / 2),
      scale: 1,
      rotation: 0,
      iconName: iconName,
      iconFamily: iconFamily,
      iconColor: 'black',
      iconSize: defaultIconSize,
    };
    const newElements = [...designElements, newIconElement];
    setDesignElements(newElements);
    addHistory(newElements);
    setIsStickerPickerVisible(false);
    setStickerImageUrlInput('');
  };

  // Fungsi untuk menambahkan stiker gambar (dari modal)
  const handleAddStickerImage = (imageUrl: string) => {
    // Validasi URL lebih ketat
    if (!imageUrl || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
      Alert.alert("Error", "URL gambar harus dimulai dengan 'http://' atau 'https://'.");
      return;
    }
    const newStickerElement: DesignElement = {
      id: `sticker-${Date.now()}`,
      type: 'sticker',
      x: designAreaLayout.width / 2 - 50,
      y: designAreaLayout.height / 2 - 50,
      imageUri: imageUrl,
      scale: 0.5,
      rotation: 0,
    };
    const newElements = [...designElements, newStickerElement];
    setDesignElements(newElements);
    addHistory(newElements);
    setIsStickerPickerVisible(false);
    setStickerImageUrlInput('');
  };

  // Callback untuk memperbarui elemen setelah gesture di DraggableResizableElement
  const handleUpdateDesignElement = useCallback((updatedElement: DesignElement) => {
    setDesignElements((prevElements) => {
      const newElements = prevElements.map((el) =>
        el.id === updatedElement.id ? updatedElement : el
      );
      addHistory(newElements); // Panggil addHistory di sini setelah perubahan elemen
      return newElements;
    });
  }, [addHistory]); // Dependensi addHistory agar tidak re-render terlalu sering

  const handleSaveAndOrder = async () => {
    if (designAreaRef.current) {
      try {
        const uri = await captureRef(designAreaRef, {
          format: 'png',
          quality: 0.9,
          result: 'data-uri',
        });

        Alert.alert(
          "Desain Tersimpan",
          "Desain Anda telah disimpan! Lanjutkan ke halaman pemesanan?",
          [
            { text: "Batal", style: "cancel" },
            {
              text: "Lanjutkan",
              onPress: () => {
                router.push({
                  pathname: '/keranjang',
                  params: { designedImageUri: uri, selectedColor: currentTshirtColor },
                });
              },
            },
          ]
        );
      } catch (error) {
        console.error("Gagal menangkap gambar desain:", error);
        Alert.alert("Error", "Gagal menyimpan desain. Silakan coba lagi.");
      }
    } else {
      Alert.alert("Error", "Area desain tidak ditemukan.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#4F6D55" />

      {/* Header */}
      <View className="flex-row items-center justify-between p-4 bg-[#4F6D55]">
        <TouchableOpacity className="flex-row items-center" onPress={() => router.back()}>
          <ArrowLeftIcon size={24} color="white" />
          <Text className="text-white text-xl font-bold ml-4">Design</Text>
        </TouchableOpacity>
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4 p-2 rounded-full" onPress={undo} disabled={historyIndex === 0}>
            <ArrowUturnLeftIcon size={24} color={historyIndex === 0 ? "gray" : "white"} />
          </TouchableOpacity>
          <TouchableOpacity className="mr-4 p-2 rounded-full" onPress={deleteSelectedElement}>
            <TrashIcon size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSaveAndOrder}>
            <Text className="text-white text-base font-semibold">Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Area Desain Kaus */}
      <View className="flex-1 items-center justify-center bg-gray-100 px-4 py-8">
        <View
          ref={designAreaRef}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setDesignAreaLayout({ width, height });
          }}
          style={styles.designCanvas}
        >
          {/* Gambar Kaus */}
          <Image
            source={images.baju}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'contain',
              tintColor: currentTshirtColor === 'White' ? undefined : displayColor,
            }}
          />

          {/* Render elemen desain menggunakan komponen DraggableResizableElement */}
          {designElements.map((element: DesignElement) => (
            <DraggableResizableElement
              key={element.id}
              element={element}
              onUpdateElement={handleUpdateDesignElement}
              containerWidth={designAreaLayout.width}
              containerHeight={designAreaLayout.height}
            />
          ))}
        </View>
      </View>

      {/* Navigasi Alat Desain Bawah */}
      <View className="flex-row justify-around items-center p-4 bg-gray-200 border-t border-gray-300">
        <TouchableOpacity className="items-center" onPress={() => { setActiveTool('image'); pickImage(); }}>
          <FontAwesome name="image" size={30} color={activeTool === 'image' ? '#4F6D55' : "gray"} />
          <Text className="text-xs text-gray-700 mt-1">Image</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => { setActiveTool('sticker'); setIsStickerPickerVisible(true); }}>
          <MaterialCommunityIcons name="sticker-emoji" size={30} color={activeTool === 'sticker' ? '#4F6D55' : "gray"} />
          <Text className="text-xs text-gray-700 mt-1">Sticker</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => { setActiveTool('color'); setIsColorPickerVisible(true); }}>
          <MaterialCommunityIcons name="palette" size={30} color={activeTool === 'color' ? '#4F6D55' : "gray"} />
          <Text className="text-xs text-gray-700 mt-1">Color</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Pemilih Warna */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isColorPickerVisible}
        onRequestClose={() => setIsColorPickerVisible(false)}
      >
        <View className="flex-1 justify-end items-center bg-black/50">
          <View className="w-full bg-white rounded-t-xl p-4">
            <Text className="text-xl font-bold mb-4 text-center">Pilih Warna Kaus</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {Object.entries(colorMap).map(([name, hex]) => (
                <TouchableOpacity
                  key={name}
                  className="w-16 h-16 rounded-full mx-2 border-2 border-gray-300 items-center justify-center"
                  style={{ backgroundColor: hex, borderColor: currentTshirtColor === name ? '#4F6D55' : '#ccc', borderWidth: currentTshirtColor === name ? 3 : 2 }}
                  onPress={() => {
                    setCurrentTshirtColor(name);
                    setIsColorPickerVisible(false);
                  }}
                >
                  {currentTshirtColor === name && (
                    <MaterialCommunityIcons name="check" size={24} color={hex === '#000000' ? 'white' : 'black'} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              className="bg-red-500 py-3 rounded-lg"
              onPress={() => setIsColorPickerVisible(false)}
            >
              <Text className="text-white text-center font-semibold">Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Pemilihan Stiker / Ikon */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isStickerPickerVisible}
        onRequestClose={() => setIsStickerPickerVisible(false)}
      >
        <View className="flex-1 justify-end items-center bg-black/50">
          <View className="w-full bg-white rounded-t-xl p-4">
            <Text className="text-xl font-bold mb-4 text-center">Tambahkan Stiker/Ikon</Text>

            {/* Input untuk URL Gambar/Stiker */}
            <View className="mb-4">
              <Text className="text-lg font-semibold mb-2">Stiker dari URL</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-2"
                placeholder="Masukkan URL gambar stiker (mis: https://example.com/sticker.png)"
                value={stickerImageUrlInput}
                onChangeText={setStickerImageUrlInput}
                onSubmitEditing={() => handleAddStickerImage(stickerImageUrlInput)}
              />
              <TouchableOpacity
                className="bg-blue-500 py-3 rounded-lg"
                onPress={() => handleAddStickerImage(stickerImageUrlInput)}
              >
                <Text className="text-white text-center font-semibold">Tambahkan Stiker</Text>
              </TouchableOpacity>
            </View>

            {/* Pemilihan Family Ikon */}
            <Text className="text-lg font-semibold mb-2 mt-4">Pilih Ikon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {([
                'FontAwesome',
                'MaterialCommunityIcons',
                'Ionicons'
              ] as const).map((family) => (
                <TouchableOpacity
                  key={family}
                  className={`px-4 py-2 rounded-full mx-1 ${selectedIconFamily === family ? 'bg-[#4F6D55]' : 'bg-gray-300'}`}
                  onPress={() => setSelectedIconFamily(family)}
                >
                  <Text className={`font-semibold ${selectedIconFamily === family ? 'text-white' : 'text-gray-800'}`}>
                    {family}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Daftar Ikon yang Dapat Dipilih */}
            <ScrollView className="max-h-60 mb-4">
              <View className="flex-row flex-wrap justify-center">
                {selectedIconFamily === 'FontAwesome' && [
                  'star', 'heart', 'home', 'user', 'cog', 'camera', 'umbrella', 'rocket', 'bug', 'apple', 'android', 'github'
                ].map(iconName => (
                  <TouchableOpacity key={iconName} className="p-3 m-1 border border-gray-200 rounded-lg items-center" onPress={() => handleAddIcon(iconName, 'FontAwesome')}>
                    <FontAwesome name={iconName as any} size={30} color="black" />
                    <Text className="text-xs mt-1">{iconName}</Text>
                  </TouchableOpacity>
                ))}
                {selectedIconFamily === 'MaterialCommunityIcons' && [
                  'emoticon', 'face', 'lightbulb-on', 'robot', 'shield', 'fire', 'pizza', 'cup', 'car', 'bike', 'bus', 'train', 'airplane'
                ].map(iconName => (
                  <TouchableOpacity key={iconName} className="p-3 m-1 border border-gray-200 rounded-lg items-center" onPress={() => handleAddIcon(iconName, 'MaterialCommunityIcons')}>
                    <MaterialCommunityIcons name={iconName as any} size={30} color="black" />
                    <Text className="text-xs mt-1">{iconName}</Text>
                  </TouchableOpacity>
                ))}
                {selectedIconFamily === 'Ionicons' && [
                  'happy', 'sad', 'logo-apple', 'logo-android', 'gift', 'game-controller', 'bluetooth', 'wifi', 'battery-full'
                ].map(iconName => (
                  <TouchableOpacity key={iconName} className="p-3 m-1 border border-gray-200 rounded-lg items-center" onPress={() => handleAddIcon(iconName, 'Ionicons')}>
                    <Ionicons name={iconName as any} size={30} color="black" />
                    <Text className="text-xs mt-1">{iconName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              className="bg-red-500 py-3 rounded-lg"
              onPress={() => {
                setIsStickerPickerVisible(false);
                setStickerImageUrlInput('');
              }}
            >
              <Text className="text-white text-center font-semibold">Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  designCanvas: {
    width: '80%',
    aspectRatio: 0.9,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
});