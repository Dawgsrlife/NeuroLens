export interface Caption {
  id: string;
  text: string;
  type: 'visual' | 'audio';
  timestamp: number;
  priority: 'low' | 'medium' | 'high';
}

export interface VoiceFeedback {
  text: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
}

export interface ProcessedFrame {
  captions: Caption[];
  voiceFeedback: VoiceFeedback | null;
  objects: {
    name: string;
    distance: number;
    direction: string;
  }[];
}

export interface WebcamStream {
  video: Blob;
  audio: Blob;
  timestamp: number;
} 