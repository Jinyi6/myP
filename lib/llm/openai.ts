import OpenAI from "openai";

export interface CandidateResult {
  summary: string;
  candidate: string;
}

const defaultSystemPrompt = `You are a Markdown rewriting assistant.\n- Output only the rewritten Markdown.\n- Do not wrap the response in explanations.\n- Do not change fenced code blocks (```) or block math ($$...$$) unless explicitly instructed.\n- Keep Markdown syntax valid.\n- Preserve original facts and meaning.`;

export async function generateCandidate(
  content: string,
  intent: string,
  systemPrompt = defaultSystemPrompt
): Promise<CandidateResult> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Source Markdown:\n${content}\n\nIntent:\n${intent}\n\nReturn only the candidate Markdown.`
      }
    ],
    temperature: 0.3
  });

  const candidate = response.choices[0]?.message?.content ?? content;

  return {
    summary: `Applied intent: ${intent}`,
    candidate
  };
}
