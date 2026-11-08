import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ImageBackground, Vibration, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useKeepAwake } from 'expo-keep-awake';
import Svg, { Circle } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { Mascot, ActionSheet, Button } from '../components/ui';
import { useApp } from '../store/AppContext';
import { colors, focusBgSource } from '../theme';
import { cancelNotification, scheduleIn } from '../utils/notifications';

const SESSIONS = 4;
const SIZE = 250;
const STROKE = 3;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;
const pad = (n) => String(n).padStart(2, '0');

function RoundButton({ icon, onPress, size = 52 }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ width: size, height: size, borderRadius: size / 2, borderWidth: 1, borderColor: 'rgba(245,246,246,0.3)', backgroundColor: 'rgba(13,15,16,0.4)', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}
    >
      <Feather name={icon} size={20} color={colors.text} />
    </Pressable>
  );
}

export default function FocusScreen({ navigation, route }) {
  useKeepAwake(); // mantém a tela acesa durante o foco
  const insets = useSafeAreaInsets();
  const { data, toggleTask } = useApp();
  const { focus, settings } = data;

  // Ref com as configurações atuais: as mudanças valem a partir da próxima etapa
  const cfg = useRef({ focus, settings });
  cfg.current = { focus, settings };

  const task = data.tasks.find((t) => t.id === route.params?.taskId);
  const category = task ? data.categories.find((c) => c.id === task.categoryId) : null;
  const secsOf = (p) => (p === 'focus' ? cfg.current.focus.focusMin : cfg.current.focus.breakMin) * 60;

  const [phase, setPhase] = useState('focus'); // 'focus' | 'break'
  const [session, setSession] = useState(1);
  const [running, setRunning] = useState(true);
  const [total, setTotal] = useState(() => secsOf('focus'));
  const [remaining, setRemaining] = useState(() => secsOf('focus'));
  const [finished, setFinished] = useState(false);
  const [menu, setMenu] = useState(false);
  const endAt = useRef(Date.now() + secsOf('focus') * 1000);
  const notifId = useRef(null);

  // Agenda a notificação do fim da etapa (funciona com o app em segundo plano)
  const arm = async (secs, p) => {
    await cancelNotification(notifId.current);
    notifId.current = null;
    const { focus: f, settings: s } = cfg.current;
    if (!f.alertOnEnd || !s.notifications || secs < 1) return;
    notifId.current = await scheduleIn(
      secs,
      p === 'focus' ? 'Hora de descansar' : 'De volta ao foco',
      p === 'focus' ? 'Você concluiu uma sessão de foco.' : 'O descanso acabou. Pronto para o próximo passo?'
    );
  };

  const begin = (p, s) => {
    const secs = secsOf(p);
    setPhase(p);
    setSession(s);
    setTotal(secs);
    setRemaining(secs);
    endAt.current = Date.now() + secs * 1000;
    setRunning(true);
    setFinished(false);
    arm(secs, p);
  };

  const onPhaseEnd = () => {
    Vibration.vibrate([0, 300, 150, 300]);
    if (phase === 'focus') begin('break', session);
    else if (session >= SESSIONS) {
      setRunning(false);
      setFinished(true);
      setRemaining(0);
    } else begin('focus', session + 1);
  };

  useEffect(() => {
    arm(total, 'focus');
    return () => { cancelNotification(notifId.current); };
  }, []);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      const left = Math.max(0, (endAt.current - Date.now()) / 1000);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        onPhaseEnd();
      }
    }, 250);
    return () => clearInterval(id);
  }, [running, phase, session]);

  const toggle = () => {
    if (running) {
      setRunning(false);
      cancelNotification(notifId.current);
      notifId.current = null;
    } else {
      endAt.current = Date.now() + remaining * 1000;
      setRunning(true);
      arm(remaining, phase);
    }
  };

  const skip = () => {
    if (phase === 'focus') begin('break', session);
    else if (session >= SESSIONS) navigation.goBack();
    else begin('focus', session + 1);
  };

  const secs = Math.ceil(remaining);
  const frac = total ? Math.min(1, remaining / total) : 0;
  const bgSrc = focusBgSource(focus.bg);

  const content = (
    <View style={{ flex: 1, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16, paddingHorizontal: 20 }}>
      {/* Topo */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={{ width: 40 }}>
          <Feather name="x" size={24} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>Modo de foco</Text>
        <View style={{ flexDirection: 'row', width: 40 + 16, justifyContent: 'flex-end' }}>
          <Pressable hitSlop={10} onPress={() => Alert.alert('Sons de fundo', 'Sons ambiente ainda não estão disponíveis.')} style={{ marginRight: 16 }}>
            <Feather name="music" size={20} color={colors.text} />
          </Pressable>
          <Pressable hitSlop={10} onPress={() => navigation.navigate('FocusSettings')}>
            <Feather name="sliders" size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {/* Tarefa */}
      <View style={{ alignItems: 'center', marginTop: 22 }}>
        <Text style={{ color: colors.subtle, fontSize: 11, letterSpacing: 1.2 }}>{category ? category.name.toUpperCase() : 'FOCO LIVRE'}</Text>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '600', marginTop: 6, textAlign: 'center' }}>{task ? task.title : 'Sessão de foco'}</Text>
      </View>

      {/* Relógio */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
            <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke="rgba(245,246,246,0.25)" strokeWidth={1.5} fill="none" />
            <Circle
              cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.text} strokeWidth={STROKE} fill="none" strokeLinecap="round"
              strokeDasharray={[C, C]} strokeDashoffset={C * (1 - frac)} transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          </Svg>
          <Text style={{ color: colors.text, fontSize: 64, fontWeight: '300', fontVariant: ['tabular-nums'], letterSpacing: 1 }}>
            {pad(Math.floor(secs / 60))}:{pad(secs % 60)}
          </Text>
          <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>• {finished ? 'Concluído' : phase === 'focus' ? 'Concentração' : 'Descanso'}</Text>
          <Text style={{ color: colors.subtle, fontSize: 10, letterSpacing: 1.2, marginTop: 8 }}>SESSÃO {session} DE {SESSIONS}</Text>
        </View>
      </View>

      {/* Mensagem do mascote */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
        <Mascot size={44} calm />
        <Text style={{ color: colors.text, fontSize: 13, marginLeft: 10 }}>
          {finished ? 'Ciclo completo. Bom trabalho!' : phase === 'focus' ? 'Só você e o próximo passo.' : 'Respire. Já já voltamos.'}
        </Text>
      </View>

      {/* Controles */}
      {finished ? (
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <RoundButton icon="rotate-ccw" onPress={() => begin(phase, session)} />
          <Pressable
            onPress={toggle}
            style={({ pressed }) => ({ height: 56, minWidth: 170, marginHorizontal: 16, borderRadius: 28, backgroundColor: colors.text, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.85 : 1 })}
          >
            <Feather name={running ? 'pause' : 'play'} size={18} color={colors.bg} />
            <Text style={{ color: colors.bg, fontSize: 16, fontWeight: '700', marginLeft: 8 }}>{running ? 'Pausar' : 'Retomar'}</Text>
          </Pressable>
          <RoundButton icon="more-horizontal" onPress={() => setMenu(true)} />
        </View>
      )}

      {/* Durações */}
      <View style={{ flexDirection: 'row', marginTop: 20, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(245,246,246,0.15)', backgroundColor: 'rgba(23,25,27,0.8)' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.subtle, fontSize: 12 }}>Concentração</Text>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 4 }}>{focus.focusMin} min</Text>
        </View>
        <View style={{ width: 1, backgroundColor: colors.border, marginHorizontal: 16 }} />
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={{ color: colors.subtle, fontSize: 12 }}>Descanso</Text>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 4 }}>{focus.breakMin} min</Text>
        </View>
      </View>

      <ActionSheet
        visible={menu}
        onClose={() => setMenu(false)}
        options={[
          task && !task.done && { label: 'Marcar tarefa como concluída', icon: 'check-circle', onPress: () => { toggleTask(task.id); navigation.goBack(); } },
          { label: phase === 'focus' ? 'Pular para o descanso' : 'Pular o descanso', icon: 'skip-forward', onPress: skip },
          { label: 'Encerrar sessão', icon: 'x-circle', danger: true, onPress: () => navigation.goBack() },
        ].filter(Boolean)}
      />
    </View>
  );

  if (bgSrc) {
    return (
      <ImageBackground source={bgSrc} style={{ flex: 1 }} resizeMode="cover">
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(13,15,16,0.55)' }]} />
        {content}
      </ImageBackground>
    );
  }
  if (focus.bg === 'none') return <View style={{ flex: 1, backgroundColor: colors.bg }}>{content}</View>;
  return <LinearGradient colors={['#2A2D30', '#0D0F10']} style={{ flex: 1 }}>{content}</LinearGradient>;
}
