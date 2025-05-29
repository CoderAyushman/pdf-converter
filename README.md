# 📄 PDF Converter – Node.js + LibreOffice + Docker

This is a **file conversion backend** built with **Node.js** that allows users to convert files like `.docx`, `.txt`, `.pptx`, etc., into PDF format using **LibreOffice** via the `libreoffice-convert` Node.js library. It supports **multiple file uploads**, uses **Multer** for handling file uploads, and **Docker** to ensure consistent LibreOffice availability across environments.

---

## 🚀 Features

- ✅ Convert files to PDF (e.g. DOCX → PDF, TXT → PDF, PPTX → PDF)
- ✅ Multiple file upload support
- ✅ Uses LibreOffice for high-quality conversion
- ✅ Optional Docker setup for consistent environment
- ✅ EJS web interface for quick browser testing
- ✅ Organized code structure and response format

---

## 🛠 Tech Stack

- Node.js
- Express.js
- Multer (File Upload Middleware)
- LibreOffice (via `libreoffice-convert`)
- Docker (optional)
- EJS (for testing via browser)

---

## 📁 Folder Structure

pdf-converter/
├── upload/ # Uploaded input files
├── download/ # Converted output PDFs
├── components/
│ └── fileConverter.js # Conversion logic using libreoffice-convert
├── views/
│ └── homepage.ejs # Web form to test file upload and conversion
├── app.js # Main Express server
├── Dockerfile # Docker config for LibreOffice
└── README.md


---

## 📦 Supported Input File Types

The following MIME types and extensions can be accepted and converted to PDF:

```html
<input type="file" name="files" accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.txt,.rtf,.html,.csv" multiple />

Supported extensions:

    .doc, .docx

    .xls, .xlsx

    .ppt, .pptx

    .odt, .ods, .odp

    .txt, .rtf, .csv

    .html, .htm

⚙️ Setup Instructions
1. Clone the Repository

git clone https://github.com/CoderAyushman/pdf-converter.git
cd pdf-converter

2. Install Dependencies

npm install

🐳 Docker Setup

To ensure LibreOffice works in all environments, use Docker:
1. Build Docker Image

docker build -t pdf-converter .

2. Run Docker Container

docker run -p 4000:4000 pdf-converter

    LibreOffice is installed inside the Docker container, so you don’t need to install it manually.

🌐 Web Interface (EJS)

A simple HTML frontend is available:

http://localhost:4000
