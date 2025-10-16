class AgentAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const pcmFloat32Data = input[0];
      // Create a copy to avoid detaching the original buffer
      const copy = new Float32Array(pcmFloat32Data);
      this.port.postMessage(copy.buffer, [copy.buffer]);
    }
    return true;
  }
}

registerProcessor('agent-audio-processor', AgentAudioProcessor);
