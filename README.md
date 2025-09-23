# MisaLabs Demo UI

A **React + TypeScript** front-end demo showcasing **MisaFlows**, **MisaCores**, and the **Deployment Dashboard**.

This project is a mock UI that simulates a multi-GPU deployment dashboard and interactive MisaFlow blocks with clickable mock diagrams, deploy buttons, and links to "README" and "CODE" placeholders.

---

## ✨ Features

- **Dark / Light Theme Toggle** (remembers system preference)
- **MisaFlows Section**
  - Clickable building blocks (Customer Support, Grant Recommender, WebCrawler, etc.)
  - Mock architecture diagrams rendered dynamically
  - Buttons for README, CODE, and Deploy
- **MisaCores Section**
  - Displays core LLM models with custom logos (OpenAI, DeepSeek, Anthropic, Ollama)
- **Deployment Dashboard**
  - GPU environment cards (Development, Migration, Production)
  - Embedded live demo (iframe)
- **Filter & Sort Controls** for flows and cores
- Responsive grid layout (works on small screens)

---

## 🛠️ Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for fast builds
- [Lucide Icons](https://lucide.dev/) for clean, scalable icons
- Pure CSS (no Tailwind, no external CSS frameworks)

---

## 📦 Installation

Clone this repository and install dependencies:

```bash
git clone https://github.com/laurentiu-misalabs/misalabs-demo-ui.git
cd misalabs-demo-ui
npm install


# run locally
npm run dev
