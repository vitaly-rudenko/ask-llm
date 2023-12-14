# Ask LLM

![Screenshot](docs/screenshot.png)

## Description

This Chrome extension allows you to quickly open chat with LLM (ChatGPT or Bard) to ask questions, summarize and analyze selected text.

Features:
- 💵 Free: uses ChatGPT/Bard chat directly (without OpenAI/Google APIs)
- 🔒 Safe: this extension does not store anything related to your Google or OpenAI accounts
- 🔍 Explain, summarize, translate and improve the selected text or the whole page
- 💡 Create quizzes to test your knowledge

## Installation guide

1. Go to the extension directory:
```
cd chrome-extension
```

2. Install NPM packages:
```
npm i
```

3. Build the extension:
```
npm run build
```

4. Go to `chrome://extensions` in your browser (`Manage Extensions` button in your settings).

5. Enable `Developer mode`:

![](docs/developer-mode.png)

6. Click `Load unpacked` and select `chrome-extension/dist` directory:

![](docs/load-unpacked.png)

7. Done ✅

## Stack & tools
- React, TypeScript
- Vite, CrxJS
- Chrome Extension API

## Commands
- `npm run dev` – run bot locally
- `npm run build` – create a production build
