import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const data = req.body;

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "maestrycomp@gmail.com",
      subject: "Novo lead",
      html: `
        <h3>Novo Lead</h3>
        <p><b>Nome:</b> ${data.nome}</p>
        <p><b>Instagram:</b> ${data.instagram}</p>
        <p><b>WhatsApp:</b> ${data.whatsapp}</p>
        <p><b>Meta:</b> ${data.meta}</p>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
}
