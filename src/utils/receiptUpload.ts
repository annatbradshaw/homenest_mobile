import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { File } from 'expo-file-system';
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
      })
    : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
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

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const filename = `receipt_${timestamp}_${randomStr}.jpg`;
    const path = `${tenantId}/${projectId}/${filename}`;

    // Read file as bytes using new File API
    const file = new File(compressedUri);
    const bytes = await file.bytes();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(RECEIPT_BUCKET)
      .upload(path, bytes, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    // Store the path - we'll generate signed URLs when displaying
    return { success: true, url: path };
  } catch (error) {
    console.error('Receipt upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload receipt',
    };
  }
}

/**
 * Get a signed URL for viewing a receipt (expires in 1 hour)
 * Handles both old full URLs and new path-only storage
 */
export async function getReceiptSignedUrl(receiptUrl: string): Promise<string | null> {
  try {
    // Extract path if it's a full URL (legacy data)
    let path = receiptUrl;
    if (receiptUrl.includes(`${RECEIPT_BUCKET}/`)) {
      const parts = receiptUrl.split(`${RECEIPT_BUCKET}/`);
      path = parts[parts.length - 1];
    }

    const { url, error } = await storage.getSignedUrl(RECEIPT_BUCKET, path, 3600);
    if (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
    return url || null;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
}

/**
 * Delete receipt image from Supabase Storage
 */
export async function deleteReceiptImage(path: string): Promise<boolean> {
  try {
    // Path is stored directly now (not a full URL)
    const { error } = await supabase.storage.from(RECEIPT_BUCKET).remove([path]);
    return !error;
  } catch (error) {
    console.error('Delete receipt error:', error);
    return false;
  }
}
