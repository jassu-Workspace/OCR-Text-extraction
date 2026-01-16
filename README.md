🧠 OCR Text Extraction SystemA modern, full-stack Optical Character Recognition (OCR) system optimized for high accuracy and user privacy. This application processes images and documents locally on the server, ensuring sensitive data never leaves your controlled environment.✨ Key FeaturesLocal Processing: No third-party OCR APIs; your data stays private.High Fidelity: Powered by the Tesseract engine for precise text extraction.Real-time Feedback: Live extraction status and progress updates.Responsive UI: Clean, modern interface built with Tailwind CSS and Shadcn/UI.File Management: Drag-and-drop uploads and one-click downloads for extracted text.Cloud Ready: Pre-configured for seamless deployment on Render.🏗️ System ArchitectureThe system utilizes a decoupled full-stack architecture to ensure scalability and speed:Code snippetgraph LR
  A[Frontend: React/Vite] -->|Upload Image| B[Backend: Node.js/Express]
  B -->|Local Processing| C[Tesseract.js Engine]
  C -->|Extracted Text| B
  B -->|JSON Response| A
Client: Handles file validation and result rendering.Server: Manages file buffers and coordinates the OCR engine.OCR Engine: Executes text extraction locally on the server node.🧑‍💻 Tech StackLayerTechnologyFrontendReact (TypeScript), Vite, Tailwind CSS, Shadcn/UIBackendNode.js, Express.jsOCR EngineTesseract.jsMiddlewareMulter (File Handling)DeploymentRender (Web Service + Static Site)📁 Project StructurePlaintextOCR-Text-extraction/
├── components/             # Reusable UI components
│   ├── FileDropZone.tsx    # Drag-and-drop logic
│   ├── ExtractionStatus.tsx # Progress indicators
│   └── ResultsPanel.tsx    # Text display area
├── server/                 # Backend infrastructure
│   ├── utils/              # OCR & File helper functions
│   ├── eng.traineddata     # Tesseract language data
│   └── server.js           # Express entry point
├── App.tsx                 # Main application logic
├── vite.config.ts          # Frontend build config
└── README.md
🚀 Getting Started1. Clone & SetupBashgit clone https://github.com/jassu-Workspace/OCR-Text-extraction.git
cd OCR-Text-extraction
2. Frontend InstallationBashnpm install
npm run dev
# Running at: http://localhost:5173
3. Backend InstallationBashcd server
npm install
node server.js
# Running at: http://localhost:10000
🌐 Deployment on RenderBackend (Web Service)Root Directory: serverBuild Command: npm installStart Command: node server.jsEnvironment Variable: PORT=10000Frontend (Static Site)Root Directory: / (Project Root)Build Command: npm install && npm run buildPublish Directory: dist🔒 Privacy & SecurityPrivacy-First Design: Unlike many online tools, this system does not send your documents to external AI APIs.No Cloud Storage: Images are processed in memory or temporary buffers.Data Isolation: Each request is handled in a separate instance.Open Source Engine: Transparency through the use of Tesseract.📈 Future Roadmap[ ] Multi-language Support: Expand beyond English to 100+ languages.[ ] PDF Processing: Direct extraction from multi-page PDF documents.[ ] Handwriting Recognition: Integrating specialized models for handwritten notes.[ ] History Dashboard: Local storage for tracking previous extractions.👨‍🎓 AuthorJaswanthMajor: B.Tech – ECMFocus: Frontend & Full-Stack DevelopmentGitHub: @jassu-Workspace📜 LicenseThis project is licensed for educational and academic use. Developed for portfolio and research purposes.
