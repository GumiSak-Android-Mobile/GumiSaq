import icons from "@/constants/icons";
import { router } from "expo-router";
import { Image, SafeAreaView, Text, TouchableOpacity } from "react-native";

const PaymentSuccess = () => {
  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center px-8">
      <Image
        source={icons.rightArrow}
        className="w-24 h-24 mb-6"
        style={{ tintColor: "#22C55E" }}
      />
      <Text className="text-2xl font-rubik-bold text-primary-500 mb-2 text-center">
        Pembayaran Berhasil!
      </Text>
      <Text className="text-lg text-black-300 mb-8 text-center">
        Terima kasih sudah berbelanja. Pesanan kamu sedang diproses.
      </Text>
      <TouchableOpacity
        className="bg-primary-500 px-8 py-3 rounded-xl"
        onPress={() => router.replace('/')}
      >
        <Text className="text-white text-lg font-rubik-bold">Kembali ke Beranda</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default PaymentSuccess;