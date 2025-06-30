import { getOrderById } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { Ionicons } from "@expo/vector-icons";
import { useStripe } from "@stripe/stripe-react-native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STRIPE_FUNCTION_URL =
  "https://cloud.appwrite.io/v1/functions/68615ddf003cd7506443/executions"; // ganti dengan function Stripe kamu

const PaymentScreen = () => {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { user } = useGlobalContext();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(orderId as string);
        setOrder(data);
        console.log("✅ Order data:", data);
      } catch (e) {
        Alert.alert("Gagal memuat pesanan");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  const payWithStripe = async () => {
    if (!order || !user || !order.totalAmount || isNaN(order.totalAmount)) {
      Alert.alert("Data pesanan tidak valid");
      return;
    }
    try {
      // 1. Dapatkan clientSecret dari backend
      const res = await fetch(STRIPE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": "683d7c58000b12d9fe82",
        },
        body: JSON.stringify({
          amount: order.totalAmount, // dalam IDR
          currency: "idr",
          customer: {
            name: user.name,
            email: user.email,
          },
        }),
      });
      const data = await res.json();
      console.log("Stripe PaymentIntent Response:", data);

      if (!data.clientSecret) throw new Error(data.error || "Gagal mendapatkan client secret");

      // 2. Init PaymentSheet (tanpa intentConfiguration)
      const init = await initPaymentSheet({
        paymentIntentClientSecret: data.clientSecret,
        merchantDisplayName: "GumiSaq", // Ganti sesuai nama merchant Anda
      });
      if (init.error) throw new Error(init.error.message);

      // 3. Tampilkan PaymentSheet
      const present = await presentPaymentSheet();
      if (present.error) throw new Error(present.error.message);

      Alert.alert("Pembayaran Berhasil", "Pesanan Anda akan segera diproses.");
      router.replace("/order-confirmation");
    } catch (e: any) {
      Alert.alert("Gagal melakukan pembayaran", e.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!order) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={28} color="#191D31" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pembayaran</Text>
        <View style={{ width: 44 }} />
      </View>
      <View style={{ padding: 20 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Total Pembayaran</Text>
          <Text style={styles.totalAmount}>
            Rp {order.totalAmount?.toLocaleString("id-ID")}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={payWithStripe}
        >
          <Text style={styles.primaryButtonText}>Bayar dengan Stripe</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitle: { fontSize: 22, fontFamily: "Rubik-ExtraBold", color: "#191D31" },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontFamily: "Rubik-Bold", color: "#333", marginBottom: 12 },
  totalAmount: { fontSize: 28, color: "#526346", fontFamily: "Rubik-Bold", marginBottom: 8 },
  primaryButton: {
    backgroundColor: "#526346",
    paddingVertical: 16,
    borderRadius: 99,
    alignItems: "center",
    marginTop: 32,
  },
  primaryButtonText: { color: "white", fontSize: 16, fontFamily: "Rubik-Bold" },
});