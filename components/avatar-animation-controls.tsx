'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TalkingHeadInstance } from '@/hooks/useTalkingHead';
import {
  applyHolographicMaterial,
  disableHolographicEffect,
} from '@/lib/holographic-material';

interface AvatarAnimationControlsProps {
  head: TalkingHeadInstance | null;
  isOpen: boolean;
  onToggle: () => void;
  embedded?: boolean; // If true, only render content (no toggle button, no sliding panel)
}

type ViewType = 'full' | 'mid' | 'upper' | 'head';
type MoodType = 'neutral' | 'happy' | 'sad' | 'angry' | 'fear' | 'love' | 'disgust' | 'sleep';
type PoseType = 'straight' | 'side' | 'hip' | 'wide';
type GestureType = 'handup' | 'index' | 'ok' | 'thumbup' | 'thumbdown' | 'side' | 'shrug';

export function AvatarAnimationControls({ head, isOpen, onToggle, embedded = false }: AvatarAnimationControlsProps) {
  const [currentView, setCurrentView] = useState<ViewType>('full');
  const [currentMood, setCurrentMood] = useState<MoodType>('neutral');
  const [speechText, setSpeechText] = useState('Hello! I am testing lip synchronization with the avatar.');
  const [animationUrl, setAnimationUrl] = useState('./animations/walking.fbx');
  const [isHolographic, setIsHolographic] = useState(false);
  const [holographicColor, setHolographicColor] = useState('#70c1ff');
  const [status, setStatus] = useState<{ message: string; type: 'info' | 'success' | 'error' }>({ 
    message: 'Ready', 
    type: 'info' 
  });

  const updateStatus = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setStatus({ message, type });
  };

  // Camera View
  const changeView = (view: ViewType) => {
    if (!head) return;
    setCurrentView(view);
    head.setView(view);
    updateStatus(`Camera view: ${view}`, 'success');
  };

  // Mood
  const changeMood = (mood: MoodType) => {
    if (!head) return;
    setCurrentMood(mood);
    head.setMood(mood);
    updateStatus(`Mood: ${mood}`, 'success');
  };

  // Poses
  const playPose = (pose: PoseType) => {
    if (!head) return;
    head.playPose(pose, null, 5);
    updateStatus(`Playing pose: ${pose} (5 seconds)`, 'success');
  };

  const stopPose = () => {
    if (!head) return;
    head.stopPose();
    updateStatus('Pose stopped', 'success');
  };

  // Gestures
  const playGesture = (gesture: GestureType) => {
    if (!head) return;
    head.playGesture(gesture, 3);
    updateStatus(`Playing gesture: ${gesture} (3 seconds)`, 'success');
  };

  const stopGesture = () => {
    if (!head) return;
    head.stopGesture();
    updateStatus('Gesture stopped', 'success');
  };

  // Look controls
  const lookAtCamera = () => {
    if (!head) return;
    head.lookAtCamera(3000);
    updateStatus('Looking at camera (3 seconds)', 'success');
  };

  const lookAhead = () => {
    if (!head) return;
    head.lookAhead(3000);
    updateStatus('Looking ahead (3 seconds)', 'success');
  };

  const makeEyeContact = () => {
    if (!head) return;
    head.makeEyeContact(5000);
    updateStatus('Making eye contact (5 seconds)', 'success');
  };

  // Speech
  const speakText = () => {
    if (!head) return;
    if (!speechText.trim()) {
      updateStatus('Please enter text to speak', 'error');
      return;
    }
    head.speakText(speechText);
    updateStatus('Speaking...', 'success');
  };

  // Animation
  const playAnimation = async () => {
    if (!head || !animationUrl.trim()) {
      updateStatus('Please enter animation URL', 'error');
      return;
    }
    try {
      updateStatus(`Loading animation: ${animationUrl}...`, 'info');
      await head.playAnimation(
        animationUrl,
        (progress: ProgressEvent) => {
          if (progress.lengthComputable) {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            updateStatus(`Loading animation: ${percent}%`, 'info');
          }
        },
        10,   // Duration: 10 seconds
        0,    // Animation index
        0.01  // Scale factor (Mixamo uses 100, RPM uses 1)
      );
      updateStatus(`Playing animation: ${animationUrl}`, 'success');
    } catch (error) {
      console.error('Animation error:', error);
      updateStatus('❌ Error loading animation: ' + (error as Error).message, 'error');
    }
  };

  const stopAnimation = () => {
    if (!head) return;
    head.stopAnimation();
    updateStatus('Animation stopped', 'success');
  };

  // Holographic Effect
  const toggleHolographic = () => {
    if (!head) return;
    const newState = !isHolographic;
    setIsHolographic(newState);
    
    if (newState) {
      applyHolographicMaterial(head, {
        enabled: true,
        color: holographicColor,
      });
      updateStatus('✨ Holographic effect enabled', 'success');
    } else {
      disableHolographicEffect(head);
      updateStatus('Holographic effect disabled', 'success');
    }
  };

  const changeHolographicColor = (color: string) => {
    setHolographicColor(color);
    if (isHolographic && head) {
      applyHolographicMaterial(head, {
        enabled: true,
        color,
      });
      updateStatus(`Holographic color: ${color}`, 'success');
    }
  };

  // Combo Demo
  const playComboDemo = async () => {
    if (!head) return;
    
    updateStatus('Starting combo demo...', 'success');
    
    head.setView('full');
    setCurrentView('full');
    await sleep(500);
    
    head.setMood('happy');
    setCurrentMood('happy');
    await sleep(500);
    
    head.playGesture('thumbup', 3);
    head.speakText('Hello! This is a combination demo.');
    await sleep(4000);
    
    head.setView('head');
    setCurrentView('head');
    head.speakText('Now you can see my face better for lip sync.');
    await sleep(4000);
    
    head.setView('full');
    setCurrentView('full');
    head.playPose('side', null, 3);
    head.speakText('I can also change my pose.');
    await sleep(4000);
    
    head.setMood('neutral');
    setCurrentMood('neutral');
    updateStatus('Demo complete!', 'success');
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const statusColors = {
    info: 'border-blue-500 bg-blue-950/30',
    success: 'border-green-500 bg-green-950/30',
    error: 'border-red-500 bg-red-950/30',
  };

  // Render the controls content
  const controlsContent = (
    <>
      {/* Status */}
      <div className={`p-3 rounded border-l-4 text-sm mb-4 ${statusColors[status.type]}`}>
        {status.message}
      </div>

      {/* Camera View */}
      <Section title="📷 Camera View">
        <ButtonGrid>
          <Button onClick={() => changeView('full')} active={currentView === 'full'}>
            Full Body
          </Button>
          <Button onClick={() => changeView('mid')} active={currentView === 'mid'}>
            Mid Body
          </Button>
          <Button onClick={() => changeView('upper')} active={currentView === 'upper'}>
            Upper Body
          </Button>
          <Button onClick={() => changeView('head')} active={currentView === 'head'}>
            Head Only
          </Button>
        </ButtonGrid>
      </Section>

      {/* Mood */}
      <Section title="😊 Mood">
        <ButtonGrid>
          {(['neutral', 'happy', 'sad', 'angry', 'fear', 'love'] as MoodType[]).map(mood => (
            <Button
              key={mood}
              onClick={() => changeMood(mood)}
              active={currentMood === mood}
            >
              {mood.charAt(0).toUpperCase() + mood.slice(1)}
            </Button>
          ))}
        </ButtonGrid>
      </Section>

      {/* Poses */}
      <Section title="🧍 Body Pose">
        <ButtonGrid>
          {(['straight', 'side', 'hip', 'wide'] as PoseType[]).map(pose => (
            <Button key={pose} onClick={() => playPose(pose)}>
              {pose.charAt(0).toUpperCase() + pose.slice(1)}
            </Button>
          ))}
        </ButtonGrid>
        <Button onClick={stopPose} fullWidth className="mt-2">
          Stop Pose
        </Button>
      </Section>

      {/* Gestures */}
      <Section title="👋 Hand Gestures">
        <ButtonGrid>
          {(['handup', 'index', 'ok', 'thumbup', 'thumbdown', 'shrug'] as GestureType[]).map(gesture => (
            <Button key={gesture} onClick={() => playGesture(gesture)}>
              {gesture === 'thumbup' ? 'Thumbs Up' :
               gesture === 'thumbdown' ? 'Thumbs Down' :
               gesture === 'handup' ? 'Hand Up' :
               gesture.charAt(0).toUpperCase() + gesture.slice(1)}
            </Button>
          ))}
        </ButtonGrid>
        <Button onClick={stopGesture} fullWidth className="mt-2">
          Stop Gesture
        </Button>
      </Section>

      {/* Look Direction */}
      <Section title="👁️ Look Direction">
        <ButtonGrid>
          <Button onClick={lookAtCamera}>At Camera</Button>
          <Button onClick={lookAhead}>Ahead</Button>
          <Button onClick={makeEyeContact}>Eye Contact</Button>
        </ButtonGrid>
      </Section>

      {/* Speech */}
      <Section title="🗣️ Text-to-Speech">
        <p className="text-xs text-gray-400 italic mb-2">
          Type text and click Speak to test lip sync
        </p>
        <textarea
          value={speechText}
          onChange={(e) => setSpeechText(e.target.value)}
          className="w-full bg-gray-800 text-white border border-gray-600 rounded p-2 text-sm mb-2 min-h-[80px] resize-vertical"
          placeholder="Enter text to speak..."
        />
        <Button onClick={speakText} fullWidth>
          Speak
        </Button>
      </Section>

      {/* External Animation */}
      <Section title="🎬 External Animation">
        <p className="text-xs text-gray-400 italic mb-2">
          Load FBX animation files (Mixamo)
        </p>
        <input
          type="text"
          value={animationUrl}
          onChange={(e) => setAnimationUrl(e.target.value)}
          className="w-full bg-gray-800 text-white border border-gray-600 rounded p-2 text-sm mb-2"
          placeholder="./animations/walking.fbx"
        />
        <div className="space-y-2">
          <Button onClick={playAnimation} fullWidth>
            Play Animation
          </Button>
          <Button onClick={stopAnimation} fullWidth>
            Stop Animation
          </Button>
        </div>
      </Section>

      {/* Holographic Effect */}
      <Section title="✨ Holographic Effect">
        <Button 
          onClick={toggleHolographic} 
          fullWidth
          active={isHolographic}
        >
          {isHolographic ? '✨ Holographic ON' : 'Holographic OFF'}
        </Button>
        {isHolographic && (
          <div className="mt-3 bg-gray-800 border border-gray-600 rounded p-3">
            <label className="text-xs text-gray-400 block mb-2">Color:</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={holographicColor}
                onChange={(e) => changeHolographicColor(e.target.value)}
                className="h-10 w-full cursor-pointer rounded border border-gray-600 bg-gray-700"
              />
              <span className="text-xs text-gray-400 min-w-[70px]">{holographicColor}</span>
            </div>
          </div>
        )}
      </Section>

      {/* Combo Demo */}
      <Section title="🎭 Combo Demo">
        <Button onClick={playComboDemo} fullWidth>
          Play Demo Sequence
        </Button>
      </Section>
    </>
  );

  // EMBEDDED MODE: Just render the content in a simple container
  if (embedded) {
    return (
      <div className="space-y-3">
        {controlsContent}
      </div>
    );
  }

  // STANDALONE MODE: Render with toggle button and sliding panel
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 z-[60] bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg shadow-lg transition-colors"
        aria-label="Toggle animation controls"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          )}
        </svg>
      </button>

      {/* Control Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-[400px] bg-gray-900 border-l-2 border-gray-700 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-blue-400 border-b-2 border-blue-400 pb-3 mb-4">
                🎮 Animation Controls
              </h2>
              {controlsContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Helper Components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-blue-300 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function ButtonGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {children}
    </div>
  );
}

interface ButtonProps {
  onClick: () => void;
  active?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

function Button({ onClick, active, fullWidth, className = '', children }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        ${fullWidth ? 'w-full' : ''}
        ${active ? 'bg-blue-500 border-blue-400' : 'bg-gray-800 border-gray-600 hover:bg-blue-500 hover:border-blue-400'}
        text-white border rounded px-2 py-1.5 text-xs transition-all duration-200 active:scale-95
        ${className}
      `}
    >
      {children}
    </button>
  );
}

