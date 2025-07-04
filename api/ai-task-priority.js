export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, motivation, deadline } = req.body;

  const prompt = `Du bist eine KI, die Aufgaben nach ihrer Wichtigkeit bewertet (1 = unwichtig, 5 = sehr wichtig).
Gib nur eine Zahl von 1 bis 5 als Antwort zurück – keine Erklärung.

Titel: ${title}
Motivation: ${motivation}
Deadline: ${deadline ?? 'keine'}

Antwort:`;

  try {
    const hfResponse = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-small", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    const result = await hfResponse.json();

    if (result.error) {
      console.error("Hugging Face Error:", result);
      return res.status(500).json({ error: result.error });
    }

    const output = result?.[0]?.generated_text ?? "";
    const match = output.match(/\b[1-5]\b/);
    const rating = match ? parseInt(match[0], 10) : 3;

    res.status(200).json({ rating });

  } catch (error) {
    console.error("Serverfehler:", error);
    res.status(500).json({ error: "Serverfehler", details: error.message });
  }
}
