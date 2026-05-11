import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

import { api } from '@/services/api';

export interface LocalImageValue {
  kind: 'local-image';
  uri: string;
  fileName: string;
  mimeType: string;
}

const IMAGE_DIRECTORY = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? ''}smartpanel-images/`;

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function buildFileName(asset: ImagePicker.ImagePickerAsset) {
  const originalName = asset.fileName?.trim();
  const extensionFromMime = asset.mimeType?.split('/').pop()?.replace('jpeg', 'jpg') || 'jpg';

  if (!originalName) {
    return `image-${Date.now()}.${extensionFromMime}`;
  }

  const hasExtension = originalName.includes('.');
  const baseName = sanitizeFileName(originalName);
  return hasExtension ? baseName : `${baseName}.${extensionFromMime}`;
}

async function ensureImageDirectoryExists() {
  if (!IMAGE_DIRECTORY) {
    throw new Error('Nao foi possivel definir um diretorio local para imagens.');
  }

  await FileSystem.makeDirectoryAsync(IMAGE_DIRECTORY, { intermediates: true });
  return IMAGE_DIRECTORY;
}

export const isLocalImageValue = (value: unknown): value is LocalImageValue => {
  return Boolean(
    value &&
      typeof value === 'object' &&
      (value as LocalImageValue).kind === 'local-image' &&
      typeof (value as LocalImageValue).uri === 'string'
  );
};

export const getImagePreviewUri = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  if (isLocalImageValue(value)) {
    return value.uri;
  }

  return null;
};

export const hasImageValue = (value: unknown): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return isLocalImageValue(value);
};

export async function pickAndPersistImage(): Promise<LocalImageValue | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error('Permissao para acessar a galeria e necessaria para anexar imagens.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 1,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  const asset = result.assets[0];
  const directory = await ensureImageDirectoryExists();
  const fileName = buildFileName(asset);
  const localUri = `${directory}${Date.now()}-${fileName}`;

  await FileSystem.copyAsync({ from: asset.uri, to: localUri });

  return {
    kind: 'local-image',
    uri: localUri,
    fileName,
    mimeType: asset.mimeType || 'image/jpeg',
  };
}

export async function uploadLocalImageToCloudinary(image: LocalImageValue, folder = 'submissions') {
  const formData = new FormData();
  formData.append('file', {
    uri: image.uri,
    name: image.fileName,
    type: image.mimeType,
  } as any);
  formData.append('folder', folder);

  const response = await api.post('/uploads/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const url = response.data?.url;
  if (!url) {
    throw new Error('Upload sem URL de retorno.');
  }

  return url as string;
}

async function normalizeValue(value: any): Promise<any> {
  if (isLocalImageValue(value)) {
    return uploadLocalImageToCloudinary(value);
  }

  if (Array.isArray(value)) {
    return Promise.all(value.map((item) => normalizeValue(item)));
  }

  if (value && typeof value === 'object') {
    const entries = await Promise.all(
      Object.entries(value).map(async ([key, item]) => [key, await normalizeValue(item)])
    );

    return Object.fromEntries(entries);
  }

  return value;
}

export async function normalizeSubmissionFormData(formData: Record<string, any>) {
  const entries = await Promise.all(
    Object.entries(formData || {}).map(async ([key, value]) => [key, await normalizeValue(value)])
  );

  return Object.fromEntries(entries) as Record<string, any>;
}