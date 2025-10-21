// Vercel Serverless Function for contact form
// Validates reCAPTCHA and sends email via Resend

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, company, message, recaptchaToken } = req.body;

    // Validate required fields
    if (!name || !email || !message || !recaptchaToken) {
      return res.status(400).json({ 
        error: 'Naam, e-mail, bericht en reCAPTCHA zijn verplicht' 
      });
    }

    // Verify reCAPTCHA token
    const recaptchaResponse = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
      }
    );

    const recaptchaData = await recaptchaResponse.json();

    // Check if reCAPTCHA validation failed
    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      console.error('reCAPTCHA validation failed:', recaptchaData);
      return res.status(400).json({ 
        error: 'reCAPTCHA validatie mislukt. Probeer het opnieuw.' 
      });
    }

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'AK Web Solutions <noreply@akwebsolutions.nl>',
        to: 'info@akwebsolutions.nl',
        reply_to: email,
        subject: `Nieuw contactformulier - ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
              Nieuw contactformulier
            </h2>
            
            <div style="background: #f4f4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Naam:</strong> ${name}</p>
              <p style="margin: 10px 0;"><strong>E-mail:</strong> <a href="mailto:${email}">${email}</a></p>
              ${phone ? `<p style="margin: 10px 0;"><strong>Telefoon:</strong> ${phone}</p>` : ''}
              ${company ? `<p style="margin: 10px 0;"><strong>Bedrijf/Website:</strong> ${company}</p>` : ''}
            </div>

            <div style="margin: 20px 0;">
              <h3 style="color: #333; margin-bottom: 10px;">Bericht:</h3>
              <p style="background: white; padding: 15px; border-left: 4px solid #6366f1; white-space: pre-wrap;">${message}</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
              <p>Dit bericht is verstuurd via het contactformulier op akwebsolutions.nl</p>
              <p>reCAPTCHA score: ${recaptchaData.score}</p>
            </div>
          </div>
        `
      })
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('Resend API error:', emailData);
      return res.status(500).json({ 
        error: 'Er ging iets mis bij het versturen. Probeer het later opnieuw.' 
      });
    }

    // Success!
    return res.status(200).json({ 
      success: true,
      message: 'Bedankt! We nemen binnen 1 werkdag contact op.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ 
      error: 'Er ging iets mis. Probeer het later opnieuw of mail naar info@akwebsolutions.nl' 
    });
  }
}
