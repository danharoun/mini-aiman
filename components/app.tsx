'use client';

import { useEffect, useMemo, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import { motion } from 'motion/react';
import { RoomAudioRenderer, RoomContext, StartAudio } from '@livekit/components-react';
import { toastAlert } from '@/components/alert-toast';
import { SessionView } from '@/components/session-view';
import { Toaster } from '@/components/ui/sonner';
import { Welcome } from '@/components/welcome';
import useConnectionDetails from '@/hooks/useConnectionDetails';
import type { AppConfig } from '@/lib/types';

const MotionWelcome = motion.create(Welcome);
const MotionSessionView = motion.create(SessionView);

interface AppProps {
  appConfig: AppConfig;
}

export function App({ appConfig }: AppProps) {
  const room = useMemo(() => new Room(), []);
  const [sessionStarted, setSessionStarted] = useState(true); // AUTO-START: Changed to true
  const { refreshConnectionDetails, existingOrRefreshConnectionDetails } =
    useConnectionDetails(appConfig);

  useEffect(() => {
    const onDisconnected = () => {
      console.log('⚠️ Disconnected from room. Auto-reconnecting...');
      
      toastAlert({
        title: 'Connection Lost',
        description: 'Reconnecting automatically...',
      });
      
      // Auto-reconnect after disconnect
      setTimeout(() => {
        console.log('🔄 Attempting auto-reconnect...');
        setSessionStarted(false);
        refreshConnectionDetails();
        
        // Re-enable session after a brief delay
        setTimeout(() => {
          setSessionStarted(true);
        }, 500);
      }, 1000);
    };
    
    const onMediaDevicesError = (error: Error) => {
      toastAlert({
        title: 'Encountered an error with your media devices',
        description: `${error.name}: ${error.message}`,
      });
    };
    
    room.on(RoomEvent.MediaDevicesError, onMediaDevicesError);
    room.on(RoomEvent.Disconnected, onDisconnected);
    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.off(RoomEvent.MediaDevicesError, onMediaDevicesError);
    };
  }, [room, refreshConnectionDetails]);

  useEffect(() => {
    let aborted = false;
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptConnection = async () => {
      if (aborted) return;
      
      try {
        await Promise.all([
          room.localParticipant.setMicrophoneEnabled(true, undefined, {
            preConnectBuffer: appConfig.isPreConnectBufferEnabled,
          }),
          existingOrRefreshConnectionDetails().then((connectionDetails) =>
            room.connect(connectionDetails.serverUrl, connectionDetails.participantToken)
          ),
        ]);
        
        console.log('✅ Connected successfully');
      } catch (error: any) {
        if (aborted) return;
        
        retryCount++;
        console.error(`❌ Connection failed (attempt ${retryCount}/${maxRetries}):`, error);
        
        if (retryCount < maxRetries) {
          toastAlert({
            title: 'Connection Failed',
            description: `Retrying... (${retryCount}/${maxRetries})`,
          });
          
          // Wait before retrying (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Retry
          await attemptConnection();
        } else {
          toastAlert({
            title: 'Connection Failed',
            description: 'Unable to connect after multiple attempts. Please refresh the page.',
          });
          
          // Auto-refresh after final failure
          setTimeout(() => {
            console.log('🔄 Auto-refreshing page after connection failure...');
            window.location.reload();
          }, 3000);
        }
      }
    };
    
    if (sessionStarted && room.state === 'disconnected') {
      attemptConnection();
    }
    
    return () => {
      aborted = true;
      room.disconnect();
    };
  }, [room, sessionStarted, appConfig.isPreConnectBufferEnabled]);

  const { startButtonText } = appConfig;

  return (
    <main>
      {/* Welcome screen hidden - auto-connect enabled */}
      
      <RoomContext.Provider value={room}>
        <RoomAudioRenderer />
        <StartAudio label="Start Audio" />
        {/* --- */}
        <MotionSessionView
          key="session-view"
          appConfig={appConfig}
          disabled={!sessionStarted}
          sessionStarted={sessionStarted}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0 }}
        />
      </RoomContext.Provider>

      <Toaster />
    </main>
  );
}
