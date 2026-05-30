# 🛡️ MaskMyID

MaskMyID is a powerful, privacy-first web application designed to help users securely redact sensitive information from personal documents before sharing them. 

Built with React and modern web technologies, MaskMyID operates **100% locally in your browser**. Your documents are never uploaded to a server, ensuring absolute data privacy. It features an intelligent auto-detect OCR engine that scans for sensitive patterns (like Aadhaar numbers) and automatically suggests masks.

### ✨ Key Highlights
* **Zero-Server Privacy:** All processing, OCR detection, and image generation happens on your device.
* **Smart Detection:** Automatically scans documents for sensitive data patterns.
* **Rich Editing Suite:** Choose between Solid Black, Pixelate, or Blur masks in both Rectangle and Circle shapes.
* **High-Performance Canvas:** Pan, zoom, and precisely edit masks on high-resolution images with ease.

### 🚀 Getting Started

First, install the dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

### 🛠️ Tech Stack
* React
* TypeScript
* Tailwind CSS
* Tesseract.js (for local client-side OCR)
* Vite
* Lucide React (for icons)

### 📝 License
This project is open-source and available under the MIT License.
