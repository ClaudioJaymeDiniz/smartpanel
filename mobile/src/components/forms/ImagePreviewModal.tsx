import React from 'react';
import { Modal, Pressable, Image, StyleSheet } from 'react-native';

interface ImagePreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function ImagePreviewModal({ imageUrl, onClose }: ImagePreviewModalProps) {
  return (
    <Modal visible={Boolean(imageUrl)} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.previewBackdrop} onPress={onClose}>
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.previewImage} resizeMode="contain" />
        )}
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  previewBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  previewImage: { width: '100%', height: '80%', borderRadius: 12 },
});