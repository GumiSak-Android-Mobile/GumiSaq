// OrderPage.js
import { useRouter, useLocalSearchParams } from 'expo-router'; // Import useLocalSearchParams
import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { ArrowLeftIcon, HeartIcon, HomeIcon, ShoppingCartIcon, UserIcon, BellIcon } from 'react-native-heroicons/outline';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import images from '@/constants/images';
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

// Example T-shirt details
const TSHIRT_NAME = "Shinsusinjin";
const STORE_NAME = "GumisaQ Studio";
const PRICE_PER_UNIT = 130;

export default function OrderPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { designedImageUri, selectedColor } = params; 

  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);

  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const totalPrice = PRICE_PER_UNIT * quantity;

  const handleOrder = () => {
    Alert.alert(
      "Konfirmasi Pesanan",
      `Anda akan memesan ${quantity} pcs kaos ${TSHIRT_NAME} ukuran ${selectedSize} dengan total harga Rp${totalPrice}. Lanjutkan?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Pesan Sekarang",
          onPress: () => {
            Alert.alert("Pesanan Dibuat", "Pesanan Anda berhasil dibuat!");
            router.push('/');
          },
        },
      ]
    );
  };

  // const imageSource = designedImageUri ? { uri: designedImageUri } : DEFAULT_TSHIRT_IMAGE;
  // Tentukan warna latar belakang kaus, ini opsional jika gambar desain sudah mencakup warna kaus
  const displayBgColor = colorMap[selectedColor as string] || 'transparent';


  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#4F6D55" />

      {/* Header */}
      <View className="flex-row items-center justify-between p-4 bg-[#4F6D55]">
        <TouchableOpacity className="flex-row items-center" onPress={() => router.back()}>
          <ArrowLeftIcon size={24} color="white" />
          <Text className="text-white text-xl font-bold ml-4">GumisaQ Studio</Text>
        </TouchableOpacity>
        <View />
      </View>

      {/* Product Image Area */}
      <View className="items-center justify-center bg-gray-100 py-4 flex-[0.55]">
        <View
          className="w-[75%] aspect-square rounded-lg overflow-hidden bg-gray-200 shadow-md"
          // Opsional: set warna latar belakang kontainer gambar sesuai warna kaus yang dipilih
          // Ini berguna jika gambar desain yang di-capture hanya elemen desainnya saja, dan bukan kaus penuh
          style={{ backgroundColor: displayBgColor }}
        >
          <Image
            source={images.baju} // <--- Gunakan imageSource yang dinamis
            style={{ width: '100%', height: '100%', resizeMode: 'contain' }}

          />
        </View>
      </View>

      {/* Product Details Card */}
      <View className="absolute bottom-0 w-full bg-white p-4 pt-8 rounded-t-3xl shadow-lg" style={{ height: height * 0.45, paddingBottom: 20 }}>
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-bold text-gray-800">{TSHIRT_NAME}</Text>
            <Text className="text-gray-500 text-sm">{STORE_NAME}</Text>
          </View>
          <Text className="text-2xl font-bold text-[#4F6D55]">Rp{PRICE_PER_UNIT}</Text>
        </View>

        {/* Size Selection */}
        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2 text-gray-700">Ukuran</Text>
          <View className="flex-row flex-wrap">
            {availableSizes.map((size) => (
              <TouchableOpacity
                key={size}
                className={`py-2 px-4 border rounded-full mr-2 mb-2 ${selectedSize === size ? 'bg-[#4F6D55] border-[#4F6D55]' : 'border-gray-300 bg-white'}`}
                onPress={() => setSelectedSize(size)}
              >
                <Text className={selectedSize === size ? 'text-white font-semibold' : 'text-gray-700'}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quantity Selection */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2 text-gray-700">Jumlah</Text>
          <View className="flex-row items-center">
            <TouchableOpacity
              className="bg-gray-200 p-2 rounded-full"
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <MaterialCommunityIcons name="minus" size={20} color="gray" />
            </TouchableOpacity>
            <Text className="text-xl font-bold mx-4">{quantity}</Text>
            <TouchableOpacity
              className="bg-gray-200 p-2 rounded-full"
              onPress={() => setQuantity(quantity + 1)}
            >
              <MaterialCommunityIcons name="plus" size={20} color="gray" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Button */}
        <TouchableOpacity
          className="w-full bg-[#4F6D55] py-4 rounded-full flex-row justify-center items-center"
          onPress={handleOrder}
        >
          <ShoppingCartIcon size={24} color="white" />
          <Text className="text-white text-lg font-bold ml-2">Order (Rp{totalPrice})</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}