# Agent Starter for React

This is a starter template for [LiveKit Agents](https://docs.livekit.io/agents) that provides a simple voice interface using the [LiveKit JavaScript SDK](https://github.com/livekit/client-sdk-js). It supports [voice](https://docs.livekit.io/agents/start/voice-ai), [transcriptions](https://docs.livekit.io/agents/build/text/), and [virtual avatars](https://docs.livekit.io/agents/integrations/avatar).

Also available for:
[Android](https://github.com/livekit-examples/agent-starter-android) • [Flutter](https://github.com/livekit-examples/agent-starter-flutter) • [Swift](https://github.com/livekit-examples/agent-starter-swift) • [React Native](https://github.com/livekit-examples/agent-starter-react-native)

<picture>
  <source srcset="./.github/assets/readme-hero-dark.webp" media="(prefers-color-scheme: dark)">
  <source srcset="./.github/assets/readme-hero-light.webp" media="(prefers-color-scheme: light)">
  <img src="./.github/assets/readme-hero-light.webp" alt="App screenshot">
</picture>

### Features:

- Real-time voice interaction with LiveKit Agents
- **3D TalkingHead avatar with lip-sync** (TalkingHead.js integration)
- **Holographic shader effects** with customizable colors (GLSL shaders)
- **Mobile/Android performance optimization** (40-60% FPS improvement)
- **Real-time FPS monitoring** (mobile only)
- Camera video streaming support
- Screen sharing capabilities
- Audio visualization and level monitoring
- Light/dark theme switching with system preference detection
- Customizable branding, colors, and UI text via configuration

This template is built with Next.js and is free for you to use or modify as you see fit.

### Project structure

```
agent-starter-react/
├── app/
│   ├── (app)/
│   ├── api/
│   ├── components/
│   ├── fonts/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── livekit/
│   ├── ui/
│   ├── app.tsx
│   ├── session-view.tsx
│   └── welcome.tsx
├── hooks/
├── lib/
├── public/
└── package.json
```

## Getting started

> [!TIP]
> If you'd like to try this application without modification, you can deploy an instance in just a few clicks with [LiveKit Cloud Sandbox](https://cloud.livekit.io/projects/p_/sandbox/templates/agent-starter-react).

[![Open on LiveKit](https://img.shields.io/badge/Open%20on%20LiveKit%20Cloud-002CF2?style=for-the-badge&logo=external-link)](https://cloud.livekit.io/projects/p_/sandbox/templates/agent-starter-react)

Run the following command to automatically clone this template.

```bash
lk app create --template agent-starter-react
```

Then run the app with:

```bash
pnpm install
pnpm dev
```

And open http://localhost:3000 in your browser.

You'll also need an agent to speak with. Try our starter agent for [Python](https://github.com/livekit-examples/agent-starter-python), [Node.js](https://github.com/livekit-examples/agent-starter-node), or [create your own from scratch](https://docs.livekit.io/agents/start/voice-ai/).

## Configuration

This starter is designed to be flexible so you can adapt it to your specific agent use case. You can easily configure it to work with different types of inputs and outputs:

#### Example: App configuration (`app-config.ts`)

```ts
export const APP_CONFIG_DEFAULTS = {
  companyName: 'LiveKit',
  pageTitle: 'LiveKit Voice Agent',
  pageDescription: 'A voice agent built with LiveKit',
  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  logo: '/lk-logo.svg',
  accent: '#002cf2',
  logoDark: '/lk-logo-dark.svg',
  accentDark: '#1fd5f9',
  startButtonText: 'Start call',
};
```

You can update these values in [`app-config.ts`](./app-config.ts) to customize branding, features, and UI text for your deployment.

#### Environment Variables

You'll also need to configure your LiveKit credentials in `.env.local` (copy `.env.example` if you don't have one):

```env
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=https://your-livekit-server-url
```

These are required for the voice agent functionality to work with your LiveKit project.

## 📱 Mobile/Android Optimization

This app includes **automatic performance optimizations** for mobile devices:

### Automatic Features:
- ✅ **5 Quality Levels** (Ultra Low to Ultra) - changeable in-app!
- ✅ **2GB RAM support** (Ultra Low mode with no glitch)
- ✅ **Device detection** (auto-selects best quality)
- ✅ **Adaptive rendering** (0.75x to 2.0x pixel ratio)
- ✅ **Configurable glitch** (0-50% intensity, 0.5x-2.0x speed)
- ✅ **Real-time FPS counter** (visible on mobile)

### Quality Levels:
- **🔴 Ultra Low**: 2GB RAM (no glitch, 30 FPS)
- **🟠 Low**: 4GB RAM (15% glitch, 45 FPS)
- **🟡 Medium**: 6GB RAM (25% glitch, 60 FPS) - Default
- **🟢 High**: 8GB+ RAM (35% glitch, 60 FPS)
- **💎 Ultra**: Desktop (50% glitch, 60 FPS)

### Performance Impact:
- **40-60% FPS improvement** on Android
- **Reduced GPU usage** by ~40%
- **Less overheating** and battery drain
- **2GB RAM devices now usable** (30-40 FPS)

### For Users:
- **Change quality**: Tap ☰ → Quality selector (top-left)
- **Quick fix**: Tap **✨ Holographic** button to disable (instant 2x speed boost!)
- See **`QUALITY_SETTINGS.md`** for all 5 quality levels
- See **`QUICK_FIX_LAG.md`** for instant solutions
- See **`ANDROID_OPTIMIZATION.md`** for full optimization guide

## 📚 Documentation

- **`QUALITY_SETTINGS.md`** - **NEW!** Complete guide to 5 quality levels
- **`TALKINGHEAD_LIVEKIT_INTEGRATION.md`** - Complete integration guide
- **`ANDROID_OPTIMIZATION.md`** - Full Android optimization guide
- **`QUICK_FIX_LAG.md`** - Quick fixes for lag
- **`PERFORMANCE_SUMMARY.md`** - Technical performance details

## Contributing

This template is open source and we welcome contributions! Please open a PR or issue through GitHub, and don't forget to join us in the [LiveKit Community Slack](https://livekit.io/join-slack)!
