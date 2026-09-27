\# 🤖 AI Assistant



A modern AI Assistant web application built with \*\*React.js, Node.js, Express.js, and Groq AI\*\*. The application provides an interactive chat interface where users can communicate with an AI assistant and receive fast, AI-generated responses.



\## ✨ Features



\* 💬 AI-powered chat

\* ⚡ Fast AI responses using Groq

\* 🎨 Modern and responsive user interface

\* 📝 Markdown response support

\* 💾 Chat history stored in Local Storage

\* 🔍 Search previous conversations

\* ✏️ Edit messages

\* 📋 Copy AI responses

\* 📱 Responsive design

\* 🔐 Secure API key handling with environment variables



\## 🛠️ Technologies Used



\### Frontend



\* React.js

\* Vite

\* JavaScript

\* CSS

\* React Markdown

\* React Syntax Highlighter



\### Backend



\* Node.js

\* Express.js

\* Groq SDK

\* CORS

\* dotenv



\## 📂 Project Structure



```text

AI-Assistant/

│

├── backend/

│   ├── server.js

│   ├── package.json

│   └── .env

│

├── frontend/

│   ├── public/

│   ├── src/

│   │   ├── assets/

│   │   ├── App.jsx

│   │   ├── App.css

│   │   ├── index.css

│   │   └── main.jsx

│   ├── index.html

│   ├── package.json

│   └── vite.config.js

│

├── .gitignore

└── README.md

```



\## ⚙️ Installation



\### 1. Clone the repository



```bash

git clone https://github.com/Sabagul506/AI-Assistant.git

```



\### 2. Open the project



```bash

cd AI-Assistant

```



\### 3. Install Backend Dependencies



```bash

cd backend

npm install

```



\### 4. Configure Environment Variables



Create a `.env` file inside the `backend` folder:



```env

GROQ\_API\_KEY=your\_groq\_api\_key

```



> ⚠️ Never upload your `.env` file or API key to GitHub.



\### 5. Start the Backend



```bash

node server.js

```



The backend will run on:



```text

http://localhost:5000

```



\### 6. Start the Frontend



Open a new terminal:



```bash

cd frontend

npm install

npm run dev

```



Open the local URL provided by Vite in your browser.



\## 🔌 API



\### POST `/api/chat`



The frontend sends a user message to the backend, and the backend sends the request to the AI model.



Example:



```json

{

&#x20; "message": "Hello, how are you?"

}

```



\## 🔒 Security



The Groq API key is stored using environment variables.



The `.env` file is excluded from GitHub using `.gitignore`.



Example `.gitignore`:



```text

node\_modules/

.env

dist/

```



\## 🚀 Future Improvements



\* 🖼️ Image upload and image analysis

\* 📎 File upload support

\* 📱 WhatsApp integration

\* 👤 User authentication

\* ☁️ Cloud database

\* 🌐 Online deployment

\* 🧠 Multiple AI model support



\## 👩‍💻 Author



\*\*Saba Gul\*\*



BS Information Technology Student





