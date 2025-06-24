import icons from "@/constants/icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const Payment = () => {
  const [name, setName] = useState("");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    if (!name || !card || !exp || !cvv) {
      Alert.alert("Error", "Semua data harus diisi.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace("/payment-success");
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="px-7 py-10">
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

        <Text className="text-lg font-rubik-bold mb-2">Nama di Kartu</Text>
        <TextInput
          className="border border-primary-200 rounded-xl px-4 py-3 mb-4 text-lg bg-white"
          placeholder="Nama Lengkap"
          value={name}
          onChangeText={setName}
        />

        <Text className="text-lg font-rubik-bold mb-2">Nomor Kartu</Text>
        <TextInput
          className="border border-primary-200 rounded-xl px-4 py-3 mb-4 text-lg bg-white"
          placeholder="1234 5678 9012 3456"
          keyboardType="number-pad"
          value={card}
          onChangeText={setCard}
          maxLength={19}
        />

        <View className="flex flex-row gap-4">
          <View className="flex-1">
            <Text className="text-lg font-rubik-bold mb-2">Exp</Text>
            <TextInput
              className="border border-primary-200 rounded-xl px-4 py-3 mb-4 text-lg bg-white"
              placeholder="MM/YY"
              value={exp}
              onChangeText={setExp}
              maxLength={5}
            />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-rubik-bold mb-2">CVV</Text>
            <TextInput
              className="border border-primary-200 rounded-xl px-4 py-3 mb-4 text-lg bg-white"
              placeholder="123"
              keyboardType="number-pad"
              value={cvv}
              onChangeText={setCvv}
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity
          className="bg-primary-500 rounded-xl py-3 mt-8 flex flex-row items-center justify-center"
          onPress={handlePay}
          disabled={loading}
        >
          <Text className="text-white text-lg font-rubik-bold">
            {loading ? "Memproses..." : "Bayar Sekarang"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Payment;