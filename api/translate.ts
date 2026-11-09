const MAX_TEXT_LENGTH = 5000;
const MAX_CHUNK_BYTES = 450;
const MYMEMORY_ENDPOINT = "https://api.mymemory.translated.net/get";

type TranslateBody = {
  text?: unknown;
  source?: unknown;
  target?: unknown;
};

type MyMemoryResponse = {
  responseStatus?: number;
  responseDetails?: string;
  responseData?: { translatedText?: string };
};

function splitIntoChunks(value: string, maxBytes: number): string[] {
  const chunks: string[] = [];
  let current = "";
  let currentBytes = 0;

  for (const character of value) {
    const characterBytes = new TextEncoder().encode(character).length;
    if (current && currentBytes + characterBytes > maxBytes) {
      chunks.push(current);
      current = "";
      currentBytes = 0;
    }
    current += character;
    currentBytes += characterBytes;
  }

  if (current) chunks.push(current);
  return chunks;
}

async function translateChunk(
  chunk: string,
  source: string,
  target: string,
): Promise<string> {
  const params = new URLSearchParams({
    q: chunk,
    langpair: `${source}|${target}`,
    mt: "1",
  });

  const response = await fetch(`${MYMEMORY_ENDPOINT}?${params.toString()}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  });

  const payload = (await response.json().catch(() => ({}))) as MyMemoryResponse;
  if (!response.ok || payload.responseStatus !== 200) {
    if (response.status === 429 || payload.responseStatus === 429) {
      throw new Error("The free translation limit has been reached. Please try again tomorrow.");
    }
    throw new Error(
      payload.responseDetails ||
        "The free translation service could not process this language pair. Try another pair.",
    );
  }

  const translated = payload.responseData?.translatedText;
  if (typeof translated !== "string") {
    throw new Error("The translation service returned an invalid response.");
  }
  return translated;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const body = (req.body ?? {}) as TranslateBody;
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const source = typeof body.source === "string" ? body.source.toLowerCase() : "auto";
  const target = typeof body.target === "string" ? body.target.toLowerCase() : "";

  if (!text) return res.status(400).json({ error: "Enter text to translate." });
  if (text.length > MAX_TEXT_LENGTH) {
    return res.status(413).json({ error: `Text must be ${MAX_TEXT_LENGTH} characters or fewer.` });
  }
  if (!/^[a-z-]{2,12}$/.test(source) || !/^[a-z-]{2,12}$/.test(target)) {
    return res.status(400).json({ error: "Choose valid source and target languages." });
  }
  if (source === "auto") {
    return res.status(400).json({
      error: "Automatic language detection is not available on the free provider. Please select the source language.",
    });
  }
  if (source === target) {
    return res.status(400).json({ error: "Choose two different languages." });
  }

  try {
    const chunks = splitIntoChunks(text, MAX_CHUNK_BYTES);
    const translatedChunks: string[] = [];

    // MyMemory accepts up to 500 UTF-8 bytes per request. Keep a safety margin.
    for (const chunk of chunks) {
      translatedChunks.push(await translateChunk(chunk, source, target));
    }

    return res.status(200).json({
      translatedText: translatedChunks.join(""),
      detectedLanguage: source,
      provider: "MyMemory",
      quotaNote: "The free anonymous service allows up to 5,000 characters per day.",
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === "TimeoutError"
        ? "The free translation service took too long to respond. Please try again."
        : error instanceof Error
          ? error.message
          : "Unable to reach the free translation service. Please try again shortly.";

    return res.status(502).json({ error: message });
  }
}
