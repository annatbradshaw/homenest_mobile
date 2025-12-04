import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { supabase, storage } from '../lib/supabase';
import { useAuth } from '../stores/AuthContext';
import { Document, CreateDocumentRequest, DocumentType } from '../types/database';

const DOCUMENTS_KEY = 'documents';
const PROJECTS_KEY = 'projects';
const BUCKET_NAME = 'documents';

export function useDocuments(projectId: string | undefined) {
  return useQuery({
    queryKey: [DOCUMENTS_KEY, projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!projectId,
  });
}

export function useDocument(documentId: string | undefined) {
  return useQuery({
    queryKey: [DOCUMENTS_KEY, 'detail', documentId],
    queryFn: async () => {
      if (!documentId) return null;

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) throw error;
      return data as Document;
    },
    enabled: !!documentId,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      projectId,
      file,
      metadata,
    }: {
      projectId: string;
      file: {
        uri: string;
        name: string;
        type: string;
        size: number;
      };
      metadata: CreateDocumentRequest;
    }) => {
      // Read file content
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert to blob
      const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      // Generate unique path
      const fileExt = file.name.split('.').pop();
      const filePath = `${projectId}/${Date.now()}-${file.name}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await storage.uploadFile(
        BUCKET_NAME,
        filePath,
        byteArray.buffer,
        file.type
      );

      if (uploadError) throw uploadError;

      // Get public URL
      const publicUrl = storage.getPublicUrl(BUCKET_NAME, filePath);

      // Create document record
      const { data, error } = await supabase
        .from('documents')
        .insert({
          ...metadata,
          project_id: projectId,
          url: publicUrl,
          size: file.size,
          upload_date: new Date().toISOString(),
          uploaded_by: user?.id,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Document;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_KEY, data.project_id] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, data.project_id] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const { data: doc } = await supabase
        .from('documents')
        .select('project_id, url')
        .eq('id', documentId)
        .single();

      // Delete from storage if URL exists
      if (doc?.url) {
        const urlParts = doc.url.split('/');
        const path = urlParts.slice(-2).join('/');
        await storage.deleteFile(BUCKET_NAME, [path]);
      }

      const { error } = await supabase.from('documents').delete().eq('id', documentId);

      if (error) throw error;
      return doc?.project_id;
    },
    onSuccess: (projectId) => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [DOCUMENTS_KEY, projectId] });
        queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, projectId] });
      }
    },
  });
}

// Helper to pick document
export async function pickDocument() {
  const result = await DocumentPicker.getDocumentAsync({
    type: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
    copyToCacheDirectory: true,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.name,
    type: asset.mimeType || 'application/octet-stream',
    size: asset.size || 0,
  };
}

// Helper to pick image
export async function pickImage(useCamera: boolean = false) {
  if (useCamera) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Camera permission denied');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled) return null;

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: `photo-${Date.now()}.jpg`,
      type: 'image/jpeg',
      size: asset.fileSize || 0,
    };
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Media library permission denied');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  const fileName = asset.uri.split('/').pop() || `image-${Date.now()}.jpg`;

  return {
    uri: asset.uri,
    name: fileName,
    type: asset.mimeType || 'image/jpeg',
    size: asset.fileSize || 0,
  };
}

// Get document type from mime type
export function getDocumentType(mimeType: string): DocumentType {
  if (mimeType.startsWith('image/')) return 'photo';
  if (mimeType === 'application/pdf') return 'contract';
  return 'other';
}
