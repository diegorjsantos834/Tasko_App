# Tasko_App

> **Tasko** — app de organização de tarefas, categorias e foco, feito com **Expo / React Native**.
> Criação do projeto Tasko de organização de tarefas.

📥 **[Baixar o APK (build mais recente)](https://expo.dev/accounts/arthur_ozorio_silva/projects/tasko/builds/d993e873-6fe3-491b-860b-dc82f2ebe297)**

---

## 📖 Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Recursos principais](#recursos-principais)
- [Stack tecnológica](#stack-tecnológica)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Arquitetura do app](#arquitetura-do-app)
- [Modelo de dados](#modelo-de-dados)
- [Como rodar o projeto](#como-rodar-o-projeto)
- [Comandos disponíveis](#comandos-disponíveis)
- [Notificações e lembretes](#notificações-e-lembretes)
- [Build e publicação (EAS)](#build-e-publicação-eas)
- [Roadmap / melhorias futuras](#roadmap--melhorias-futuras)
- [Licença](#licença)

---

## Sobre o projeto

O **Tasko** é um aplicativo mobile de produtividade em português (Brasil) com tema escuro,
focado em simplicidade: o usuário cria **conta**, organiza **tarefas** dentro de **categorias**,
acompanha a rotina por um **calendário** e usa um **modo de foco** (técnica pomodoro) para
executar o que planejou.

Hoje o app funciona **100% offline**: todos os dados (conta, tarefas, categorias e preferências)
ficam salvos localmente no aparelho via `AsyncStorage`. Não há backend.

## Recursos principais

| Área | O que tem |
| --- | --- |
| **Conta** | Cadastro, login, editar nome/foto/e-mail/senha, sair da conta e resetar dados |
| **Tarefas** | Criar, editar, concluir, excluir; data, horário de início, subtarefas, lembrete próprio por tarefa |
| **Categorias** | Espaços para agrupar tarefas (Estudos, Trabalho...), capa, ordenação (personalizada / A–Z / mais tarefas), visão lista ou grade, excluir em cascata |
| **Home (Hoje)** | Saudação, progresso do dia, próximas tarefas, acesso rápido às categorias |
| **Calendário** | Visões de **mês / semana / dia**, navegação entre períodos, marcação de dias com tarefas, mostrar ou ocultar concluídas |
| **Modo de foco** | Pomodoro com ciclos (foco + descanso), anel de progresso SVG, tela acesa (`keep-awake`), aviso ao fim da sessão, imagem de fundo configurável, pode iniciar a partir de uma tarefa |
| **Lembretes** | Notificações do sistema agendadas antes do início da tarefa (antecedência configurável: na hora, 5, 10, 15, 30 ou 60 min) |
| **Estatísticas** | Tarefas concluídas, pendentes e **sequência de dias no ritmo** (streak) |
| **Preferências** | Primeiro dia da semana, visão padrão do calendário, lembretes on/off, notificações on/off, duração do foco/descanso, fundo do foco |
| **Mascote & UI** | Componentes próprios (botões, campos, toggles, action sheet, capas com gradiente), mascote em SVG, tema escuro único |

## Stack tecnológica

| Camada | Tecnologia |
| --- | --- |
| Framework | [Expo SDK 58](https://docs.expo.dev/) (`expo ~58.0.23`) |
| UI | React Native `0.88.1` + React `19.3.0` (JavaScript, sem TypeScript) |
| Navegação | [`@react-navigation/native`](https://reactnavigation.org/) v7 — `native-stack` + `bottom-tabs` |
| Estado global | React Context (`src/store/AppContext.js`) |
| Persistência local | [`@react-native-async-storage/async-storage`](https://docs.expo.dev/versions/latest/sdk/async-storage/) |
| Notificações | [`expo-notifications`](https://docs.expo.dev/versions/latest/sdk/notifications/) |
| Calendário/data | [`@react-native-community/datetimepicker`](https://docs.expo.dev/versions/latest/sdk/datetimepicker/) |
| Galeria de imagens | [`expo-image-picker`](https://docs.expo.dev/versions/latest/sdk/imagepicker/) |
| Visual | `expo-linear-gradient`, `react-native-svg`, `@expo/vector-icons` (Feather) |
| Extras | `expo-keep-awake`, `expo-status-bar`, `react-native-safe-area-context`, `react-native-screens` |
| Build na nuvem | [EAS Build](https://docs.expo.dev/build/introduction/) (`eas.json`) |
| Licença do template | MIT (Expo / 650 Industries) |

## Estrutura do repositório

```
Tasko_App/
├── README.md              ← esta documentação
├── .gitattributes
└── Tasko/                 ← aplicativo Expo
    ├── AGENTS.md          ← regras/instruções para agentes de IA
    ├── App.js             ← raiz do app (providers + navegação)
    ├── index.js           ← registro do root component
    ├── app.json           ← configuração do Expo (ícones, package, plugins)
    ├── eas.json           ← perfis de build/submit do EAS
    ├── package.json
    ├── readme.md          ← guia rápido de como rodar
    ├── assets/            ← ícones, splash, mascote, imagens de fundo
    └── src/
        ├── theme.js       ← paleta de cores, tipografia e utilitários de tema
        ├── components/
        │   ├── ui.js      ← biblioteca de componentes visuais
        │   └── TabBar.js  ← barra de abas personalizada
        ├── navigation/
        │   └── index.js   ← árvore de navegadores (stack + tabs)
        ├── screens/       ← 14 telas (login, home, calendário, foco...)
        ├── store/
        │   └── AppContext.js ← estado global + persistência + ações
        └── utils/
            ├── dates.js        ← cálculos de data/mês/semana
            ├── notifications.js← agendamento de lembretes
            └── media.js        ← seletor de imagens da galeria
```

## Arquitetura do app

Fluxo geral:

```
index.js → App.js
             ├── SafeAreaProvider
             ├── AppProvider (estado + AsyncStorage)
             ├── StatusBar
             └── Navigation (src/navigation/index.js)
                     ├── [deslogado] Login / Signup
                     └── [logado]
                          ├── Tabs (abas)
                          │    ├── Home
                          │    ├── Calendar
                          │    ├── Categories (stack interna: lista → detalhe)
                          │    └── Profile
                          ├── CalendarSettings / Focus / FocusSettings
                          ├── ProfileSettings
                          └── modais: TaskForm, CategoryForm, EditAccount
```

- **Estado global:** `AppProvider` guarda `account`, `session`, `categories`, `tasks`,
  `settings` e `focus`. Toda alteração é salva automaticamente no `AsyncStorage`
  (chave `@tasko/v1`).
- **Telas (`src/screens/`):**

  | Tela | Função |
  | --- | --- |
  | `LoginScreen` / `SignupScreen` | Autenticação local (sem servidor) |
  | `HomeScreen` | Resumo do dia, progresso e próximas tarefas |
  | `CategoriesScreen` | Lista/grade de categorias com ordenação |
  | `CategoryDetailScreen` | Tarefas de uma categoria, filtros e progresso |
  | `CategoryFormScreen` | Criar/editar/excluir categoria (com capa) |
  | `TaskFormScreen` | Criar/editar tarefa: data, horário, subtarefas, lembrete |
  | `CalendarScreen` | Agenda em mês/semana/dia |
  | `CalendarSettingsScreen` | Preferências do calendário e lembretes |
  | `FocusScreen` | Timer de foco (pomodoro) |
  | `FocusSettingsScreen` | Duração do foco/descanso, fundo e alerta sonoro |
  | `ProfileScreen` | Perfil, estatísticas e atalhos |
  | `ProfileSettingsScreen` | Conta, notificações, sair da conta |
  | `EditAccountScreen` | Editar nome/foto, e-mail ou senha |

- **Componentes (`src/components/ui.js`):** `Screen`, `BackHeader`, `Logo`, `Mascot`,
  `Avatar`, `Cover`, `Button`, `IconButton`, `Field`, `Checkbox`, `Toggle`,
  `ProgressBar`, `Segmented`, `Chip`, `Row`, `Empty`, `ActionSheet`, `Sparkle`,
  `SectionLabel` — toda a base visual reutilizável do app.

## Modelo de dados

```js
account:  { name, email, password, avatar }
session:  boolean

category: { id, name, cover }

task:     { id, title, categoryId, date, start, lead,
            done, completedAt, subtasks: [{ id, title, done }],
            notifId, ... }

settings: { weekStart, view: 'month'|'week'|'day', showDone,
            reminders, lead, notifications }

focus:    { focusMin, breakMin, bg, alertOnEnd }
```

- Datas são strings `"AAAA-MM-DD"` e horários `"HH:MM"`
  (helpers em `src/utils/dates.js`).
- Ao criar a primeira conta, categorias iniciais são sugeridas:
  Estudos, Trabalho, Projetos pessoais, Rotina, Esportes e Lazer.

## Como rodar o projeto

### Pré-requisitos

- [Node.js](https://nodejs.org) (versão **LTS**)
- Um celular Android com o app **[Expo Go](https://expo.dev/go)** (Play Store / App Store)
  **ou** um emulador Android
- Celular e computador no **mesmo Wi-Fi** (se for usar o celular)

### Passo a passo

**1. Clone o repositório**

```bash
git clone <url-do-repositorio>
cd Tasko_App/Tasko
```

**2. Instale as dependências**

```bash
npm install
```

**3. Inicie o servidor de desenvolvimento**

```bash
npx expo start
```

> Use sempre `npx expo install <pacote>` para adicionar dependências novas —
> ele resolve as versões compatíveis com o SDK do Expo.

**4. Abra o app**

- **No celular:** abra o Expo Go e leia o QR code que aparece no terminal.
- **No emulador:** deixe o emulador aberto e aperte `a` no terminal.
- **No navegador:** aperte `w` (suporte web é limitado; o app é mobile-first).

**5. Crie sua conta** e comece a usar — o primeiro acesso é pela tela de cadastro.

### Alternativa: instalar o APK

Se não quiser rodar o ambiente de desenvolvimento, baixe e instale direto no Android:

📥 **[APK do Tasko (EAS Build)](https://expo.dev/accounts/arthur_ozorio_silva/projects/tasko/builds/d993e873-6fe3-491b-860b-dc82f2ebe297)**

> O instalador precisa permitir "fontes desconhecidas" no Android para instalar APKs fora da Play Store.

## Comandos disponíveis

| Comando | Descrição |
| --- | --- |
| `npm start` / `npx expo start` | Sobe o servidor de desenvolvimento |
| `npm run android` | Abre direto no emulador/dispositivo Android |
| `npm run ios` | Abre no simulador iOS (requer macOS) |
| `npm run web` | Abre no navegador |
| `npx expo-doctor` | Diagnostica problemas de dependências/configuração |
| `npx expo install --fix` | Corrige versões incompatíveis de pacotes |
| `npx expo lint` | Lint *(requer ESLint instalado)* |

## Notificações e lembretes

- `src/utils/notifications.js` configura o handler de notificações e cria o canal
  **Tasko** (importância alta) no Android.
- **Lembrete de tarefa:** agendado `lead` minutos antes do horário de início
  (ou às 09:00 do dia, se a tarefa não tem horário). Reagendado automaticamente
  ao editar a tarefa ou mudar as preferências; cancelado ao concluir/excluir.
- **Modo de foco:** avisa quando a sessão de foco termina (`Hora de descansar`)
  e quando o descanso acaba — funciona com o app em segundo plano.
- A permissão é pedida na inicialização (`setupNotifications()` em `App.js`).

## Build e publicação (EAS)

O projeto já está configurado para builds na nuvem ([EAS Build](https://docs.expo.dev/build/introduction/))
com o perfil do projeto `tasko` na conta `arthur_ozorio_silva`.

```bash
# instala a CLI (se ainda não tiver)
npm install -g eas-cli

# login na sua conta Expo
eas login

# build de teste (interno)
eas build --platform android --profile preview

# build de produção (gera AAB para a Play Store)
eas build --platform android --profile production

# envio para a loja
eas submit --platform android
```

Perfis definidos em `eas.json`:

| Perfil | Uso |
| --- | --- |
| `development` | Cliente de desenvolvimento, distribuição interna |
| `preview` | Build interno de teste (APK) |
| `production` | Build final com autoincremento de versão |

> **Nota:** não existem pastas `ios/` e `android/` no repo — elas são geradas
> automaticamente (Continuous Native Generation). Nunca crie edite essas pastas na mão:
> configure o comportamento nativo em `app.json` e config plugins.
> Após adicionar uma lib com código nativo, é preciso um development build
> (`npx expo run:android` ou `eas build --profile development`) — o Expo Go não
> inclui módulos nativos de terceiros.

## Roadmap / melhorias futuras

- [ ] Backend/sincronização em nuvem (hoje os dados são apenas locais)
- [ ] Tema claro (light mode) — atualmente só existe tema escuro
- [ ] App em inglês — hoje somente português (Brasil)
- [ ] Widgets e atalhos no iOS/Android
- [ ] Metas/recorrências de tarefas (tarefas que se repetem)
- [ ] Exportar/importar dados

## Contribuindo

1. Crie uma branch: `git checkout -b feature/minha-mudanca`
2. Faça suas alterações em `Tasko/`
3. Rode `npx expo lint` e teste o app (`npx expo start`)
4. Abra um Pull Request com uma descrição clara da mudança

Siga as orientações de `Tasko/AGENTS.md` ao escrever código (mobile-first,
compatibilidade entre plataformas e sempre conferir a documentação do Expo
da versão usada antes de usar uma API).

## Licença

Distribuído sob a licença **MIT** — veja [`Tasko/LICENSE`](Tasko/LICENSE).
