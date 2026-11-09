# Syntra Translator

Syntra is a responsive text and voice translation web app built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- Translate text using a LibreTranslate-compatible API.
- Detect the source language automatically.
- Choose source and target languages and swap them.
- Voice input using the browser Speech Recognition API where supported.
- Listen to translations using browser text-to-speech.
- Copy translated text and receive clear error feedback.
- Responsive interface and accessibility-focused controls.
- Search metadata, Open Graph tags, canonical URL, sitemap, and robots.txt.

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- Lucide React
- LibreTranslate-compatible translation service

## Local development

```bash
npm install
npm run dev
```

## Configure translation

The translation endpoint is a Vercel serverless function at `/api/translate`. It sends requests to a LibreTranslate-compatible service from the server, so API credentials are not exposed in browser code. By default, it uses the public `translate.fedilab.app` mirror, which is listed by LibreTranslate as not requiring an API key. Public mirrors can have rate limits or downtime; use a managed API key or a self-hosted instance for a more dependable production service.

Create a `.env.local` file for local development:

```env
LIBRETRANSLATE_URL=https://translate.fedilab.app
# Optional: only add this when your chosen provider requires an API key
LIBRETRANSLATE_API_KEY=your_api_key
```

For Vercel deployment, add the same variables under **Project Settings → Environment Variables**, then redeploy.

- `LIBRETRANSLATE_URL`: Base URL of your LibreTranslate instance. Defaults to the public Fedilab mirror; for managed hosting or a self-hosted instance, set your own URL.
- `LIBRETRANSLATE_API_KEY`: Required by providers such as `libretranslate.com`; optional for mirrors or self-hosted instances that do not require a key. Obtain a managed key from the official LibreTranslate portal.

Never use a `VITE_` prefix for the API key. Vite exposes `VITE_` variables to browser code.

The translation provider only supports language pairs for which it has models installed. Check your provider's supported-language list before advertising a language as available. Browser speech recognition and speech synthesis support varies by browser and device.

## Production checks

```bash
npm run lint
npm run build
```

## SEO deployment checklist

1. Confirm the canonical domain in `index.html` and `public/sitemap.xml`.
2. Add the production translation environment variables to Vercel.
3. Redeploy and test text translation, language detection, microphone permission, text-to-speech, and clipboard access on desktop and mobile.
4. Submit `https://syntratranslate.vercel.app/sitemap.xml` in Google Search Console.

## License

Add your preferred license before accepting external contributions.
