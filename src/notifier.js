function buildEmailHtml(drops) {
  const rows = drops
    .map(
      (d) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <a href="${d.url}" style="color: #143c8a; text-decoration: none; font-weight: bold;">${d.name}</a>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #e53e3e; font-weight: bold;">
          ${d.current_price.toFixed(2)} €
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; text-decoration: line-through; color: #999;">
          ${d.previous_price.toFixed(2)} €
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; color: #e53e3e; font-weight: bold;">
          -${d.drop_pct}%
        </td>
      </tr>`
    )
    .join("");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #143c8a; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px;">JYSK Price Drop Alert</h1>
      </div>
      <div style="padding: 20px;">
        <p style="color: #333; font-size: 15px;">Price drops detected on ${drops.length} item${drops.length > 1 ? "s" : ""} you're tracking:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background: #f7f7f7;">
              <th style="padding: 10px 12px; text-align: left; font-size: 13px; color: #666;">Product</th>
              <th style="padding: 10px 12px; text-align: right; font-size: 13px; color: #666;">Now</th>
              <th style="padding: 10px 12px; text-align: right; font-size: 13px; color: #666;">Was</th>
              <th style="padding: 10px 12px; text-align: center; font-size: 13px; color: #666;">Drop</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">Sent by jysk-price-tracker</p>
      </div>
    </div>`;
}

async function sendEmail(drops) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.error("SENDGRID_API_KEY is not set, skipping email notification");
    return false;
  }

  const html = buildEmailHtml(drops);
  const itemSummary = drops.map((d) => d.name).join(", ");

  const payload = {
    personalizations: [{ to: [{ email: "alexmayolc@gmail.com" }] }],
    from: { email: "alexmayol@hotmail.com", name: "JYSK Price Tracker" },
    subject: `JYSK Price Drop: ${itemSummary}`,
    content: [{ type: "text/html", value: html }],
  };

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 202) {
      console.log("Email sent successfully");
      return true;
    } else {
      const body = await response.text();
      console.error(`SendGrid error (${response.status}): ${body}`);
      return false;
    }
  } catch (err) {
    console.error(`Failed to send email: ${err.message}`);
    return false;
  }
}

module.exports = { sendEmail };
