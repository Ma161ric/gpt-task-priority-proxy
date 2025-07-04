export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, motivation, deadline } = req.body;

  const prompt = `Bewerte die Wichtigkeit dieser Aufgabe (1 bis 5):
Titel: ${title}
Motivation: ${motivation}
Deadline: ${deadline ?? 'keine'}

Antworte nur mit einer Zahl von 1 bis 5.`;

  const hfResponse = await fetch("https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  const data = await hfResponse.json();
  const text = data?.[0]?.generated_text ?? "3";
  const rating = parseInt(text.match(/\d+/)?.[0] ?? "3", 10);

  res.status(200).json({ rating: Math.max(1, Math.min(5, rating)) });
}
