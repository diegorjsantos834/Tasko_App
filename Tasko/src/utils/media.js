import * as ImagePicker from 'expo-image-picker';

// Abre a galeria e devolve o url da imagem escolhida (ou null se cancelar)
export async function pickImage(aspect = [16, 9]) {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.8,
  });
  return res.canceled ? null : res.assets[0].uri;
}
