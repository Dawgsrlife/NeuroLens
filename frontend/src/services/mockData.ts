import { Caption, VoiceFeedback, ProcessedFrame } from "@/types/api";

// Simulated captions for different scenarios
const mockCaptions: Caption[] = [
  {
    id: "1",
    text: "Person detected in frame",
    type: "object",
    timestamp: Date.now(),
    priority: "high",
  },
  {
    id: "2",
    text: "Chair 2 meters ahead",
    type: "object",
    timestamp: Date.now() + 1000,
    priority: "medium",
  },
  {
    id: "3",
    text: "Door on the right",
    type: "object",
    timestamp: Date.now() + 2000,
    priority: "high",
  },
  {
    id: "4",
    text: "Stairs detected ahead",
    type: "hazard",
    timestamp: Date.now() + 3000,
    priority: "high",
  },
];

// Simulated voice feedback
const mockVoiceFeedback: VoiceFeedback = {
  text: "Warning: Stairs detected ahead. Please proceed with caution.",
  priority: "high",
  timestamp: Date.now() + 3000,
};

// Simulated processed frame
export const mockProcessedFrame: ProcessedFrame = {
  captions: mockCaptions,
  voiceFeedback: mockVoiceFeedback,
  objects: [
    { name: "person", confidence: 0.95, position: { x: 0.5, y: 0.3 } },
    { name: "chair", confidence: 0.88, position: { x: 0.2, y: 0.7 } },
    { name: "door", confidence: 0.92, position: { x: 0.8, y: 0.4 } },
    { name: "stairs", confidence: 0.97, position: { x: 0.5, y: 0.8 } },
  ],
};

// Function to simulate real-time updates
export const simulateRealTimeUpdates = (callback: (frame: ProcessedFrame) => void) => {
  let currentIndex = 0;
  
  const interval = setInterval(() => {
    // Rotate through different scenarios
    const scenarios = [
      {
        captions: [mockCaptions[0], mockCaptions[1]],
        voiceFeedback: { text: "Person and chair detected in the room", priority: "medium", timestamp: Date.now() },
      },
      {
        captions: [mockCaptions[2], mockCaptions[3]],
        voiceFeedback: { text: "Warning: Stairs detected ahead. Please proceed with caution.", priority: "high", timestamp: Date.now() },
      },
      {
        captions: [mockCaptions[0], mockCaptions[2]],
        voiceFeedback: { text: "Person near the door", priority: "medium", timestamp: Date.now() },
      },
    ];

    const scenario = scenarios[currentIndex];
    callback({
      ...mockProcessedFrame,
      captions: scenario.captions,
      voiceFeedback: scenario.voiceFeedback,
    });

    currentIndex = (currentIndex + 1) % scenarios.length;
  }, 3000); // Update every 3 seconds

  return () => clearInterval(interval);
}; 