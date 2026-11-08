import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, Image, Modal, Switch,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';
import { colors, radius, T } from '../theme';

/* ------------------------------ Layout ------------------------------ */

// footer
export function Screen({ children, scroll = true, tabbed = false, footer, style, contentStyle }) {
  const edges = tabbed ? ['top'] : ['top', 'bottom'];
  const body = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[{ padding: 20, paddingBottom: 28, flexGrow: 1 }, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, padding: 20 }, contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: colors.bg }, style]} edges={edges}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {body}
        {footer ? <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function BackHeader({ title, onBack, icon = 'chevron-left' }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 22 }}>
      <IconButton name={icon} onPress={onBack} />
      <Text style={{ color: colors.subtle, fontSize: 14, marginLeft: 12 }}>{title}</Text>
    </View>
  );
}

export const SectionLabel = ({ children, style }) => (
  <Text style={[{ color: colors.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginTop: 8 }, style]}>
    {children}
  </Text>
);

/* ------------------------------ Marca ------------------------------ */

export function Sparkle({ size = 22, color = colors.text, stroke = 1.8 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3 C12.7 8.2 15.8 11.3 21 12 C15.8 12.7 12.7 15.8 12 21 C11.3 15.8 8.2 12.7 3 12 C8.2 11.3 11.3 8.2 12 3 Z"
        stroke={color} strokeWidth={stroke} strokeLinejoin="round" fill="none"
      />
    </Svg>
  );
}

export function Logo() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Sparkle size={22} />
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700', marginLeft: 8, letterSpacing: -0.4 }}>tasko</Text>
    </View>
  );
}

// Mascote.
const MASCOT = require('../../assets/mascote.png');

export function Mascot({ size = 120 }) {
  return <Image source={MASCOT} style={{ width: size, height: size }} resizeMode="contain" />;
}

export function Avatar({ uri, size = 100 }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {uri ? <Image source={{ uri }} style={{ width: size, height: size }} /> : <Mascot size={size * 0.72} />}
    </View>
  );
}

/* ------------------------------ Capas ------------------------------ */

const GRADS = [
  ['#3A3F44', '#15171A'], ['#2B2F33', '#0F1112'], ['#44494F', '#1A1C1F'],
  ['#34383D', '#111314'], ['#4A4F55', '#16181A'], ['#2F3337', '#0D0F10'],
];

// Capa de categoria: usa a imagem da galeria ou um degradê cinza quando não há imagem
export function Cover({ uri, seed = 0, style, children }) {
  return (
    <View style={[{ overflow: 'hidden', borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, style]}>
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <LinearGradient colors={GRADS[seed % GRADS.length]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      )}
      <LinearGradient colors={['rgba(13,15,16,0.05)', 'rgba(13,15,16,0.78)']} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

/* ------------------------------ Controles ------------------------------ */

export function Button({ title, onPress, variant = 'primary', icon, disabled, style }) {
  const primary = variant === 'primary';
  const fg = primary ? colors.bg : variant === 'danger' ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          height: 54, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          backgroundColor: primary ? colors.text : 'transparent',
          borderWidth: primary ? 0 : 1, borderColor: colors.border,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {icon ? <Feather name={icon} size={18} color={fg} style={{ marginRight: 8 }} /> : null}
      <Text style={{ color: fg, fontSize: 16, fontWeight: '600' }}>{title}</Text>
    </Pressable>
  );
}

export function IconButton({ name, onPress, size = 20, bordered = true, style }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: bordered ? 1 : 0, borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
        style,
      ]}
    >
      <Feather name={name} size={size} color={colors.text} />
    </Pressable>
  );
}

export function Field({ label, hint, error, secure, style, ...props }) {
  const [hidden, setHidden] = useState(!!secure);
  return (
    <View style={[{ marginBottom: 16 }, style]}>
      {label ? <Text style={{ color: colors.text, fontSize: 14, marginBottom: 8 }}>{label}</Text> : null}
      <View
        style={{
          flexDirection: 'row', alignItems: props.multiline ? 'flex-start' : 'center', minHeight: 54,
          backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
          paddingHorizontal: 16, paddingVertical: props.multiline ? 12 : 0,
        }}
      >
        <TextInput
          {...props}
          secureTextEntry={secure ? hidden : false}
          placeholderTextColor={colors.muted}
          selectionColor={colors.text}
          style={{ flex: 1, color: colors.text, fontSize: 15, paddingVertical: 0, minHeight: props.multiline ? 70 : 52, textAlignVertical: props.multiline ? 'top' : 'center' }}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
            <Feather name={hidden ? 'eye-off' : 'eye'} size={20} color={colors.subtle} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={{ color: colors.danger, fontSize: 12, marginTop: 6 }}>{error}</Text>
      ) : hint ? (
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 6 }}>{hint}</Text>
      ) : null}
    </View>
  );
}

export function Checkbox({ checked, onPress, size = 24 }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={{
        width: size, height: size, borderRadius: 7, borderWidth: 1.5,
        borderColor: checked ? colors.text : colors.subtle,
        backgroundColor: checked ? colors.text : 'transparent',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      {checked ? <Feather name="check" size={size - 8} color={colors.bg} /> : null}
    </Pressable>
  );
}

export function Toggle({ value, onValueChange }) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.border, true: colors.text }}
      thumbColor={value ? colors.bg : colors.subtle}
      ios_backgroundColor={colors.border}
    />
  );
}

export function ProgressBar({ value, height = 3 }) {
  return (
    <View style={{ height, borderRadius: height, backgroundColor: colors.border, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height, backgroundColor: colors.text }} />
    </View>
  );
}

export function Segmented({ options, value, onChange, style }) {
  return (
    <View style={[{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: 4, borderWidth: 1, borderColor: colors.border }, style]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{ flex: 1, height: 40, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.text : 'transparent' }}
          >
            {o.icon ? <Feather name={o.icon} size={16} color={on ? colors.bg : colors.subtle} style={{ marginRight: 8 }} /> : null}
            <Text style={{ color: on ? colors.bg : colors.subtle, fontWeight: '600', fontSize: 14 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Chip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ paddingHorizontal: 16, height: 38, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', marginRight: 8, marginBottom: 8, backgroundColor: active ? colors.text : colors.surface, borderWidth: 1, borderColor: active ? colors.text : colors.border }}
    >
      <Text style={{ color: active ? colors.bg : colors.subtle, fontSize: 14, fontWeight: active ? '600' : '400' }}>{label}</Text>
    </Pressable>
  );
}

// Linha de lista (configurações, perfil...)
export function Row({ icon, leading, title, subtitle, onPress, right, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 10, opacity: pressed ? 0.8 : 1 },
        style,
      ]}
    >
      {leading || (icon ? (
        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.raised, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name={icon} size={18} color={colors.subtle} />
        </View>
      ) : null)}
      <View style={{ flex: 1, marginLeft: leading || icon ? 14 : 0 }}>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{title}</Text>
        {subtitle ? <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      {right ?? (onPress ? <Feather name="chevron-right" size={20} color={colors.subtle} /> : null)}
    </Pressable>
  );
}

export function Empty({ title, text, action }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 28, paddingHorizontal: 12 }}>
      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', textAlign: 'center' }}>{title}</Text>
      {text ? <Text style={[T.sub, { textAlign: 'center', marginTop: 6 }]}>{text}</Text> : null}
      {action ? <View style={{ marginTop: 16, alignSelf: 'stretch' }}>{action}</View> : null}
    </View>
  );
}

/* ------------------------------ Menu inferior ------------------------------ */

// options: [{ label, sub, icon, danger, onPress }]
export function ActionSheet({ visible, onClose, title, options }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }} onPress={onClose}>
        <Pressable
          onPress={() => {}}
          style={{ backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: colors.border, padding: 20, paddingBottom: insets.bottom + 20 }}
        >
          <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 16 }} />
          {title ? <Text style={[T.h2, { marginBottom: 14 }]}>{title}</Text> : null}
          {options.map((o) => (
            <Pressable
              key={o.label}
              onPress={() => {
                onClose();
                setTimeout(() => o.onPress && o.onPress(), 200);
              }}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: radius.md, backgroundColor: pressed ? colors.raised : 'transparent' })}
            >
              {o.icon ? (
                <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.raised, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                  <Feather name={o.icon} size={19} color={o.danger ? colors.danger : colors.text} />
                </View>
              ) : null}
              <View style={{ flex: 1 }}>
                <Text style={{ color: o.danger ? colors.danger : colors.text, fontSize: 16, fontWeight: '600' }}>{o.label}</Text>
                {o.sub ? <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>{o.sub}</Text> : null}
              </View>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
