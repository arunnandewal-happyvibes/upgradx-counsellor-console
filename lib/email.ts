import { Resend } from "resend";

export function sessionSummaryHtml({
  studentName,
  programName,
  programDuration,
  counsellorName,
  rating,
}: {
  studentName: string;
  programName: string | null;
  programDuration: string | null;
  counsellorName: string | null;
  rating: number | null;
}) {
  const firstName = studentName.trim().split(/\s+/)[0] || studentName;
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f2f2f2;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f2f2;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background-color:#1a1c1c;padding:32px 40px;">
                <span style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">upGrad<span style="color:#e41f26;">X</span></span>
                <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#b8b8b8;margin-top:4px;">THE OFFLINE XPERIENCE</div>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                <div style="font-size:12px;font-weight:700;letter-spacing:1.5px;color:#e41f26;text-transform:uppercase;margin-bottom:10px;">
                  Counselling Session Summary
                </div>
                <h1 style="margin:0 0 16px 0;font-size:26px;line-height:1.3;color:#1a1c1c;">
                  Great talking with you, ${escapeHtml(firstName)}!
                </h1>
                <p style="margin:0 0 28px 0;font-size:15px;line-height:1.6;color:#603e3a;">
                  Thank you for spending time with an upGrad X counsellor today. Here's a quick recap of
                  what we discussed, so you have it on hand.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #e41f26;border-radius:10px;margin-bottom:28px;">
                  <tr>
                    <td style="padding:24px;">
                      <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#603e3a;text-transform:uppercase;margin-bottom:6px;">
                        Recommended Program
                      </div>
                      <div style="font-size:20px;font-weight:800;color:#1a1c1c;margin-bottom:4px;">
                        ${escapeHtml(programName ?? "To be finalized with your counsellor")}
                      </div>
                      ${
                        programDuration
                          ? `<div style="display:inline-block;background-color:#1a1c1c;color:#ffffff;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:4px 10px;border-radius:999px;">${escapeHtml(programDuration)}</div>`
                          : ""
                      }
                    </td>
                  </tr>
                </table>

                <div style="font-size:12px;font-weight:700;letter-spacing:1px;color:#1a1c1c;text-transform:uppercase;margin-bottom:10px;">
                  What happens next
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                  ${["Our team will reach out to you shortly with the next steps.", "You'll receive the detailed program brochure and batch schedule.", "Keep an eye on your phone and inbox for a call from our admissions team."]
                    .map(
                      (line, i) => `
                  <tr>
                    <td width="28" valign="top" style="padding:6px 0;">
                      <div style="width:20px;height:20px;border-radius:50%;background-color:#e41f26;color:#ffffff;font-size:11px;font-weight:800;text-align:center;line-height:20px;">${i + 1}</div>
                    </td>
                    <td valign="top" style="padding:6px 0 6px 10px;font-size:14px;line-height:1.5;color:#1a1c1c;">${line}</td>
                  </tr>`,
                    )
                    .join("")}
                </table>

                ${
                  rating
                    ? `<div style="margin-bottom:28px;">
                  <div style="font-size:12px;font-weight:700;letter-spacing:1px;color:#1a1c1c;text-transform:uppercase;margin-bottom:8px;">
                    Your Session Rating
                  </div>
                  <div style="font-size:24px;letter-spacing:2px;">
                    ${[1, 2, 3, 4, 5].map((n) => `<span style="color:${n <= rating ? "#e41f26" : "#e2e2e2"};">&#9733;</span>`).join("")}
                  </div>
                </div>`
                    : ""
                }

                <div style="border-top:1px solid #e2e2e2;padding-top:20px;font-size:13px;color:#9a9a9a;">
                  ${counsellorName ? `Session hosted by <strong style="color:#603e3a;">${escapeHtml(counsellorName)}</strong>.<br/>` : ""}
                  Questions in the meantime? Just reply to this email.
                </div>
              </td>
            </tr>
            <tr>
              <td style="background-color:#1a1c1c;padding:20px 40px;text-align:center;">
                <span style="font-size:11px;color:#b8b8b8;">© ${new Date().getFullYear()} upGrad Education Pvt. Ltd. All rights reserved.</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Sends the post-session recap to the student. Returns false (never throws) when
 * email isn't configured or the send fails — the close-session save must still
 * succeed even if the email doesn't go out. */
export async function sendSessionSummaryEmail(params: {
  to: string;
  studentName: string;
  programName: string | null;
  programDuration: string | null;
  counsellorName: string | null;
  rating: number | null;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn("sendSessionSummaryEmail: RESEND_API_KEY or EMAIL_FROM not configured — skipping send.");
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: `Your upGrad X counselling session — ${params.programName ?? "recap"}`,
      html: sessionSummaryHtml(params),
    });
    if (error) {
      console.error("sendSessionSummaryEmail failed:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("sendSessionSummaryEmail threw:", err);
    return false;
  }
}
