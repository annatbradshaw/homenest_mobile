import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { supabase, storage } from '../lib/supabase';

const RECEIPT_BUCKET = 'receipts';
const MAX_IMAGE_WIDTH = 1200;
const IMAGE_QUALITY = 0.8;

interface UploadReceiptResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Pick an image from the camera or library
 */
export async function pickReceiptImage(useCamera: boolean = false): Promise<string | null> {
  // Request permissions
  if (useCamera) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }
  }

  const result = useCamera
    ? await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
      })
    : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
      });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0].uri;
}

/**
 * Compress and resize image while maintaining quality
 */
export async function compressImage(uri: string): Promise<string> {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_IMAGE_WIDTH } }],
    {
      compress: IMAGE_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return manipResult.uri;
}

/**
 * Upload receipt image to Supabase Storage
 */
export async function uploadReceiptImage(
  imageUri: string,
  tenantId: string,
  projectId: string
): Promise<UploadReceiptResult> {
  try {
    // Compress the image first
    const compressedUri = await compressImage(imageUri);

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(compressedUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const filename = `receipt_${timestamp}_${randomStr}.jpg`;
    const path = `${tenantId}/${projectId}/${filename}`;

    // Convert base64 to ArrayBuffer
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(RECEIPT_BUCKET)
      .upload(path, bytes.buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const publicUrl = storage.getPublicUrl(RECEIPT_BUCKET, path);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Receipt upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload receipt',
    };
  }
}

/**
 * Delete receipt image from Supabase Storage
 */
export async function deleteReceiptImage(receiptUrl: string): Promise<boolean> {
  try {
    // Extract path from URL
    const urlParts = receiptUrl.split(`${RECEIPT_BUCKET}/`);
    if (urlParts.length < 2) return false;

    const path = urlParts[1];
    const { error } = await supabase.storage.from(RECEIPT_BUCKET).remove([path]);

    return !error;
  } catch (error) {
    console.error('Delete receipt error:', error);
    return false;
  }
}
