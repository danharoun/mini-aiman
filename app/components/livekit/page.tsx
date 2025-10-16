'use client';

import { useState } from 'react';
import { Track } from 'livekit-client';
import { AgentControlBar } from '@/components/livekit/agent-control-bar/agent-control-bar';
import { DeviceSelect } from '@/components/livekit/device-select';
import { TrackToggle } from '@/components/livekit/track-toggle';
import { TalkingHeadAvatar } from '@/components/livekit/talking-head-avatar';
import { HolographicControls } from '@/components/livekit/holographic-controls';
import { Container } from '../Container';

export default function LiveKit() {
  const [isHolographic, setIsHolographic] = useState(false);
  const [holographicColor, setHolographicColor] = useState('#70c1ff');
  const [isToggling, setIsToggling] = useState(false);

  const handleHolographicToggle = () => {
    const controls = (window as any).talkingHeadHolographicControls;
    if (controls && controls.toggle) {
      setIsToggling(true);
      controls.toggle();
      setTimeout(() => setIsToggling(false), 400);
    }
  };

  const handleHolographicColorChange = (newColor: string) => {
    setHolographicColor(newColor);
    const controls = (window as any).talkingHeadHolographicControls;
    if (controls && controls.setColor) {
      controls.setColor(newColor);
    }
  };

  return (
    <>
      {/* TalkingHead Avatar Demo - FULLSCREEN */}
      <Container>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-muted-foreground text-sm">
            3D Avatar with LiveKit Voice Agent Integration
          </h3>
        </div>
        {/* Make it much larger - almost fullscreen */}
        <div className="h-[calc(100vh-200px)] min-h-[800px] w-full rounded-lg overflow-hidden shadow-2xl">
          <TalkingHeadAvatar 
            enableControls={true}
            disableSidebarHolographicControls={true}
            holographic={{
              enabled: false,
              color: holographicColor,
              
              // HEIGHT-BASED INTENSITY (face visible, body more holographic)
              faceIntensity: 0.2,    // 20% effect on face/hair (keeps details visible)
              bodyIntensity: 1.0,    // 100% effect on body (full holographic)
              upperThreshold: 1.3,   // Y position for face/hair area
              lowerThreshold: 0.3,   // Y position for body area
              
              // MASK EXCLUSION: Uncomment if you want to completely exclude specific meshes
              // excludeMeshNames: ['E_MODEL_TEST_0DOUBLE__1'],  // Try mesh 1
              // excludeMaterialNames: ['MIDIUM_CIELCE_'],  // Try material 1
            }}
            onHolographicChange={(enabled, color) => {
              setIsHolographic(enabled);
              setHolographicColor(color);
            }}
          />
        </div>

        {/* Bottom Control Bar with Holographic Controls */}
        <div className="mt-4 flex items-center justify-center gap-4 p-4 bg-black/30 backdrop-blur-xl rounded-lg border border-white/10">
          <HolographicControls
            isEnabled={isHolographic}
            color={holographicColor}
            onToggle={handleHolographicToggle}
            onColorChange={handleHolographicColorChange}
            disabled={isToggling}
          />
        </div>
      </Container>

      {/* Device select */}
      <Container>
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground text-sm">A device select component.</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-muted-foreground mb-2 font-mono text-xs uppercase">Size default</h4>
            <DeviceSelect kind="audioinput" />
          </div>
          <div>
            <h4 className="text-muted-foreground mb-2 font-mono text-xs uppercase">Size sm</h4>
            <DeviceSelect size="sm" kind="audioinput" />
          </div>
        </div>
      </Container>

      {/* Track toggle */}
      <Container>
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground text-sm">A track toggle component.</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-muted-foreground mb-2 font-mono text-xs uppercase">
              Track.Source.Microphone
            </h4>
            <TrackToggle variant="outline" source={Track.Source.Microphone} />
          </div>
          <div>
            <h4 className="text-muted-foreground mb-2 font-mono text-xs uppercase">
              Track.Source.Camera
            </h4>
            <TrackToggle variant="outline" source={Track.Source.Camera} />
          </div>
        </div>
      </Container>

      {/* Agent control bar */}
      <Container>
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground text-sm">A control bar component.</h3>
        </div>
        <div className="relative flex items-center justify-center">
          <AgentControlBar
            className="w-full"
            capabilities={{
              supportsChatInput: true,
              supportsVideoInput: true,
              supportsScreenShare: true,
            }}
          />
        </div>
      </Container>
    </>
  );
}
