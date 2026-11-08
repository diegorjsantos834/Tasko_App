import React, { useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Screen, BackHeader, Button, Row, Toggle, SectionLabel } from '../components/ui';
import { useApp } from '../store/AppContext';
import { colors, T, focusBgSource, focusBgLabel } from '../theme';
import { pickImage } from '../utils/media';

function Stepper({ label, value, onMinus, onPlus }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
      <Text style={T.sub}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
        <Pressable onPress={onMinus} hitSlop={12}><Feather name="minus" size={20} color={colors.text} /></Pressable>
        <Text style={{ color: colors.text, fontSize: 30, fontWeight: '700' }}>{value}</Text>
        <Pressable onPress={onPlus} hitSlop={12}><Feather name="plus" size={20} color={colors.text} /></Pressable>
      </View>
      <Text style={[T.caption, { textAlign: 'center', marginTop: 4 }]}>minutos</Text>
    </View>
  );
}

export default function FocusSettingsScreen({ navigation }) {
  const { data, updateFocus } = useApp();
  const [f, setF] = useState(data.focus);
  const set = (patch) => setF((v) => ({ ...v, ...patch }));
  const step = (key, delta, min, max) => set({ [key]: Math.min(max, Math.max(min, f[key] + delta)) });

  const choose = async () => {
    const uri = await pickImage([9, 16]);
    if (uri) set({ bg: uri });
  };
  const save = () => {
    updateFocus(f);
    navigation.goBack();
  };

  const src = focusBgSource(f.bg);

  return (
    <Screen footer={<Button title="Salvar alterações" onPress={save} />}>
      <BackHeader title="Modo de foco" onBack={() => navigation.goBack()} />
      <Text style={T.title}>Seu foco, do seu jeito.</Text>
      <Text style={[T.sub, { marginTop: 8, marginBottom: 22 }]}>Ajuste o ambiente e encontre o seu ritmo.</Text>

      <SectionLabel>Imagem de fundo</SectionLabel>
      <View style={{ height: 132, borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, justifyContent: 'flex-end', padding: 16 }}>
        {src ? (
          <Image source={src} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <LinearGradient colors={f.bg === 'none' ? [colors.surface, colors.bg] : ['#3A3F44', '#15171A']} style={StyleSheet.absoluteFill} />
        )}
        <LinearGradient colors={['rgba(13,15,16,0)', 'rgba(13,15,16,0.8)']} style={StyleSheet.absoluteFill} />
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{focusBgLabel(f.bg)}</Text>
        <Text style={{ color: colors.subtle, fontSize: 12, marginTop: 2 }}>Fundo atual</Text>
        <View style={{ position: 'absolute', right: 14, bottom: 14, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="check" size={16} color={colors.bg} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', marginTop: 12, marginBottom: 14 }}>
        <Button title="Trocar imagem" icon="image" variant="ghost" onPress={choose} style={{ flex: 2, marginRight: 10, backgroundColor: colors.surface }} />
        <Button title="Sem imagem" variant="ghost" onPress={() => set({ bg: 'none' })} style={{ flex: 1.2, backgroundColor: colors.surface }} />
      </View>

      <SectionLabel style={{ marginTop: 10 }}>Duração dos ciclos</SectionLabel>
      <View style={{ flexDirection: 'row', marginBottom: 14 }}>
        <Stepper label="Concentração" value={f.focusMin} onMinus={() => step('focusMin', -5, 5, 90)} onPlus={() => step('focusMin', 5, 5, 90)} />
        <View style={{ width: 12 }} />
        <Stepper label="Descanso" value={f.breakMin} onMinus={() => step('breakMin', -1, 1, 30)} onPlus={() => step('breakMin', 1, 1, 30)} />
      </View>

      <Row
        icon="bell" title="Aviso ao terminar" subtitle="Som ao concluir o foco ou o descanso"
        right={<Toggle value={f.alertOnEnd} onValueChange={(v) => set({ alertOnEnd: v })} />}
      />

      <Text style={[T.caption, { textAlign: 'center', marginTop: 10 }]}>Os ajustes valem para a próxima sessão.</Text>
    </Screen>
  );
}
