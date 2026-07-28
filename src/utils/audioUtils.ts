/**
 * Converts PCM 16-bit little-endian binary data to a playable WAV Blob.
 */
export function pcmToWavBlob(pcm16Data: Int16Array, sampleRate: number = 24000): Blob {
  const buffer = new ArrayBuffer(44 + pcm16Data.length * 2);
  const view = new DataView(buffer);

  const writeString = (v: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      v.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  /* RIFF chunk descriptor */
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcm16Data.length * 2, true);
  writeString(view, 8, 'WAVE');

  /* fmt sub-chunk */
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 channel - Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)

  /* data sub-chunk */
  writeString(view, 36, 'data');
  view.setUint32(40, pcm16Data.length * 2, true);

  /* Write the PCM samples */
  let offset = 44;
  for (let i = 0; i < pcm16Data.length; i++, offset += 2) {
    view.setInt16(offset, pcm16Data[i], true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

export function playBase64PcmAudio(base64Audio: string, sampleRate: number = 24000): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    try {
      const binaryString = window.atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const pcm16 = new Int16Array(bytes.buffer);
      const wavBlob = pcmToWavBlob(pcm16, sampleRate);
      const audioUrl = URL.createObjectURL(wavBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = (e) => reject(e);
      audio.play().then(() => resolve(audio)).catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}
