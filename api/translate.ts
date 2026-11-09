const MAX_TEXT_LENGTH = 5000;

type TranslateBody = {
  text?: unknown;
  source?: unknown;
  target?: unknown;
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const body = (req.body ?? {}) as TranslateBody;
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const source = typeof body.source === "string" ? body.source : "auto";
  const target = typeof body.target === "string" ? body.target : "";

  if (!text) return res.status(400).json({ error: "Enter text to translate." });
  if (text.length > MAX_TEXT_LENGTH) {
    return res.status(413).json({ error: `Text must be ${MAX_TEXT_LENGTH} characters or fewer.` });
  }
  if (!/^[a-zA-Z-]{2,12}$/.test(source) || !/^[a-zA-Z-]{2,12}$/.test(target)) {
    return res.status(400).json({ error: "Choose valid source and target languages." });
  }
  if (source !== "auto" && source.toLowerCase() === target.toLowerCase()) {
    return res.status(400).json({ error: "Choose two different languages." });
  }

  const baseUrl = process.env.LIBRETRANSLATE_URL || "https://translate.fedilab.app";
  const apiKey = process.env.LIBRETRANSLATE_API_KEY;
  try {
    const endpoint = `${baseUrl.replace(/\/$/, "")}/translate`;
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        q: text,
        source,
        target,
        format: "text",
        ...(apiKey ? { api_key: apiKey } : {}),
      }),
      signal: AbortSignal.timeout(25000),
    });

    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const providerMessage =
        typeof payload.error === "string" ? payload.error : "The translation provider rejected the request.";
      return res.status(upstream.status >= 500 ? 502 : upstream.status).json({
        error: providerMessage,
      });
    }

    const translatedText = payload.translatedText;
    if (typeof translatedText !== "string" || !translatedText.trim()) {
      return res.status(502).json({ error: "The translation provider returned an invalid response." });
    }

    return res.status(200).json({
      translatedText,
      detectedLanguage: payload.detectedLanguage?.language ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === "TimeoutError"
        ? "The translation service took too long to respond. Please try again."
        : "Unable to reach the translation service. Please try again shortly.";
    return res.status(502).json({ error: message });
  }
}