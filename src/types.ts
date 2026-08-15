export interface GiftItem {
  id: string;
  name: string;
  category: string;
  image: string;
  images?: string[];
  description?: string;
  isReserved: boolean;
  reservedBy?: string;
  reservedAt?: string;
  reservationMessage?: string;
  isCustomAdded?: boolean;
}

export interface InspirationPhoto {
  id: string;
  title: string;
  imageUrl: string;
  room?: string;
}

export interface HouseInfo {
  coupleNames: string;
  eventDate: string;
  location: string;
  welcomeMessage: string;
}

export interface TexturesConfig {
  bambuImage?: string;
  inoxImage?: string;
}

export interface ColorSwatch {
  name: string;
  colorCode: string;
  textColor: string;
  borderColor?: string;
  description: string;
  textureImage?: string;
  isTexture?: boolean;
}
