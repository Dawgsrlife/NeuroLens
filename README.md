# NeuroLens - AI-Powered Vision Assistant

NeuroLens is an innovative application designed to assist individuals with visual impairments by providing real-time visual feedback through AI-powered object detection and voice assistance.

## Features

- Real-time webcam feed processing
- Object detection and recognition
- Natural language voice feedback
- Customizable detection sensitivity
- Dark mode support
- Keyboard shortcuts
- Accessibility features

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript 5.8
- Tailwind CSS 4.0
- Framer Motion 12.5
- WebSocket API
- Web Speech API
- Additional Libraries:
  - @headlessui/react 2.2
  - @heroicons/react 2.2
  - next-themes 0.4.6
  - zustand 5.0.3
  - gsap 3.12.7
  - lenis 1.2.3

### Backend
- FastAPI 0.115.11
- OpenCV (opencv-python-headless 4.11.0.86)
- OpenAI API 1.68.2
- WebSocket (websockets 15.0.1)
- Additional Libraries:
  - Computer Vision:
    - ultralytics 8.3.94 (YOLO)
    - pytesseract 0.3.13 (OCR)
    - pillow 11.1.0
  - Audio Processing:
    - pydub 0.25.1
    - sounddevice 0.5.1
    - scipy 1.15.2
  - Deep Learning:
    - torch 2.6.0
    - torchvision 0.21.0
  - Utilities:
    - pydantic 2.10.6
    - pydantic-settings 2.8.1
    - python-dotenv 1.0.1
    - python-multipart 0.0.20
    - httpx 0.28.1

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- Webcam
- Microphone

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/NeuroLens.git
cd NeuroLens
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# frontend/.env.local
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# backend/.env
OPENAI_API_KEY=your_openai_api_key
```

### Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn app.main:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Press the Space key to start/stop the assistant
2. The webcam feed will be processed in real-time
3. Detected objects and environmental information will be displayed as captions
4. Voice feedback will be provided for important observations
5. Use the settings modal to customize:
   - Voice volume and style
   - Detection sensitivity
   - Detection range

## Keyboard Shortcuts

- `Space`: Toggle assistant on/off
- `Esc`: Close modals
- `Tab`: Navigate through interactive elements
- `Enter`: Activate buttons and controls
- `Ctrl/Cmd + D`: Toggle dark mode
- `Ctrl/Cmd + ,`: Open settings
- `Ctrl/Cmd + Shift + R`: Start/Stop recording
- `Ctrl/Cmd + /`: Open about page

## Accessibility

NeuroLens is designed with accessibility in mind:

- High contrast mode support
- Screen reader compatibility
- Keyboard navigation
- Customizable voice feedback
- Adjustable text size and contrast

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for GPT and Whisper APIs
- The open-source community for various tools and libraries
