import icons from "@/constants/icons";
import images from "@/constants/images";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get('window');

// Contoh data keranjang (ganti dengan data dari context/global state jika sudah ada)
const initialCart = [
  {
    id: "1",
    name: "Baju Adat Sasak",
    image: images.baju,
    price: 120000,
    qty: 1,
  },
  {
    id: "2",
    name: "Baju Opik",
    image: images.baju,
    price: 200000,
    qty: 2,
  },
];

const CartScreen = () => {
  const [cart, setCart] = useState(initialCart);

  // Hitung ukuran gambar berdasarkan lebar layar
  const cardWidth = screenWidth - 32; // 32 = padding horizontal (16 * 2)
  const imageWidth = cardWidth - 32; // 32 = padding card (16 * 2)
  const imageHeight = Math.min(imageWidth * 0.6, 200); // Aspek rasio 3:5 dengan max height 200

  const handleRemove = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    router.push('/payment');
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="p-2 rounded-full bg-gray-50">
          <Image source={icons.leftArrow} className="w-6 h-6" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-rubik-bold text-center text-black-300 mr-10">
          Keranjang
        </Text>
      </View>

      {cart.length === 0 ? (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-lg font-rubik text-black-200">
            Keranjang kosong
          </Text>
        </View>
      ) : (
        <View className="flex-1">
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="mb-4 p-4 rounded-xl bg-white shadow-md shadow-black-100/20 border border-gray-100">
                {/* Rating Badge */}
                <View className="absolute top-4 right-4 flex-row items-center bg-white/95 px-2 py-1 rounded-full shadow-sm z-10">
                  <Image source={icons.star} className="w-3 h-3" />
                  <Text className="text-xs font-rubik-medium text-primary-300 ml-1">
                    4.4
                  </Text>
                </View>

                {/* Product Image */}
                <Image
                  source={item.image}
                  style={{ 
                    width: imageWidth, 
                    height: imageHeight,
                    borderRadius: 8,
                    backgroundColor: '#F3F4F6'
                  }}
                  resizeMode="cover"
                />

                {/* Product Info */}
                <View className="mt-4">
                  <Text className="text-lg font-rubik-bold text-black-300 leading-5">
                    {item.name}
                  </Text>
                  <Text className="text-sm font-rubik text-black-200 mt-1">
                    Jumlah: {item.qty}
                  </Text>
                  
                  {/* Price and Remove Button */}
                  <View className="flex-row items-center justify-between mt-4">
                    <Text className="text-lg font-rubik-bold text-primary-500">
                      Rp{item.price.toLocaleString("id-ID")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemove(item.id)}
                      className="p-2 rounded-full bg-red-50"
                    >
                      <Image 
                        source={icons.trash} 
                        className="w-5 h-5" 
                        style={{ tintColor: "#EF4444" }} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />

          {/* Checkout Section */}
          <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-rubik-bold text-black-300">
                Total
              </Text>
              <Text className="text-xl font-rubik-bold text-primary-500">
                Rp{total.toLocaleString("id-ID")}
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={handleCheckout}
              className="bg-primary-500 py-4 rounded-xl items-center shadow-sm"
            >
              <Text className="text-white font-rubik-bold text-lg">
                Checkout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;