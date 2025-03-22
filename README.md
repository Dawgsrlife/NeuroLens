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
- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- WebSocket API
- Web Speech API

### Backend
- FastAPI
- OpenCV
- OpenAI/Gemini APIs
- WebSocket

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
GEMINI_API_KEY=your_gemini_api_key
```

### Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
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
- Google for Gemini API
- The open-source community for various tools and libraries
