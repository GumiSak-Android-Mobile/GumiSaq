export interface Article {
	$id: string;
	$createdAt: string;
	$updatedAt: string;
	title: string;
	description: string;
	description2?: string;
	description3?: string;
	content: string;
	image: string;
	image2?: string;
	image3?: string;
	category: "Semua" | "Hiburan" | "Benda" | "Tradisi" | "Adat";
	author: string;
	tags: string[];
	isPublished: boolean;
	viewCount: number;
}
