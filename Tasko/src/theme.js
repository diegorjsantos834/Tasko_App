// Paleta de cores
export const colors = {
  bg: '#0D0F10',
  surface: '#17191B',
  raised: '#1F2225',
  border: '#2A2D30',
  muted: '#6B7076',
  subtle: '#9AA0A6',
  text: '#F5F6F6',
  danger: '#E5736B',
};

export const radius = { sm: 12, md: 16, lg: 22, pill: 999 };

// Estilos de texto reutilizáveis
export const T = {
  title: { color: colors.text, fontSize: 30, fontWeight: '700', letterSpacing: -0.6, lineHeight: 36 },
  h2: { color: colors.text, fontSize: 20, fontWeight: '700' },
  body: { color: colors.text, fontSize: 15 },
  sub: { color: colors.subtle, fontSize: 13 },
  caption: { color: colors.muted, fontSize: 12 },
};

// Fundo padrão do modo de foco.
export const DEFAULT_FOCUS_BG = { label: 'Montanhas', source: require('../assets/montanhas.jpg') };

// bg pode ser 'default', 'none' ou o url de uma imagem escolhida na galeria
export const focusBgSource = (bg) => {
  if (bg === 'none') return null;
  if (bg === 'default') return DEFAULT_FOCUS_BG.source;
  return { uri: bg };
};
export const focusBgLabel = (bg) => {
  if (bg === 'none') return 'Sem imagem';
  if (bg === 'default') return DEFAULT_FOCUS_BG.label;
  return 'Imagem escolhida';
};
