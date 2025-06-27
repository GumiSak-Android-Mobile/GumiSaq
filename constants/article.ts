export interface Article {
	$id: string;
	$createdAt: string;
	$updatedAt: string;
	title: string;
	description: string;
	content: string;
	image: string;
	category: "Hiburan" | "Benda" | "Tradisi" | "Adat";
	author: string;
	tags: string[];
	isPublished: boolean;
	viewCount: number;
}
export interface DesignElement {
	id: string;
	type: 'text' | 'image' | 'sticker' | 'icon';
	x: number;
	y: number;
	rotation?: number;
	scale?: number;
	text?: string;
	textColor?: string;
	fontSize?: number;
	imageUri?: string;

	iconName?: string; // Nama ikon (misal: 'star', 'heart', 'home')
	iconFamily?: 'FontAwesome' | 'MaterialCommunityIcons' | 'Ionicons' | string; // Family ikon (misal: 'FontAwesome')
	iconColor?: string; // Warna ikon
	iconSize?: number; // Ukuran dasar ikon sebelum scaling
  }  