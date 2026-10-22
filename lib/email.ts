import { Resend } from "resend";
import type { LearnerInsights } from "@/lib/learnerInsights";

export type EmailProgram = { name: string; duration: string | null };

/** One-page profile snapshot: readiness score, strengths, gaps, and the top 1–2 programs. */
function diagnosticHtml(insights: LearnerInsights, programs: EmailProgram[]) {
  const list = (items: string[], mark: string, color: string) =>
    items.length === 0
      ? `<div style="font-size:13px;color:#9a9a9a;">Nothing major.</div>`
      : items
          .map(
            (t) => `<div style="font-size:14px;line-height:1.45;color:#1a1c1c;padding:4px 0;"><span style="color:${color};font-weight:800;">${mark}</span>&nbsp; ${escapeHtml(t)}</div>`,
          )
          .join("");
  const pct = Math.max(0, Math.min(100, insights.score));
  return `
                <div style="font-size:12px;font-weight:700;letter-spacing:1px;color:#1a1c1c;text-transform:uppercase;margin-bottom:10px;">
                  Your profile snapshot
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e3e3e3;border-radius:10px;margin-bottom:28px;">
                  <tr>
                    <td style="padding:22px 24px;border-bottom:1px solid #e3e3e3;">
                      <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#603e3a;text-transform:uppercase;">Placement readiness</div>
                      <div style="margin:6px 0 10px 0;">
                        <span style="font-size:32px;font-weight:800;color:#1a1c1c;">${pct}</span><span style="font-size:15px;color:#9a9a9a;"> / 100</span>
                        <span style="display:inline-block;margin-left:10px;background-color:#1a1c1c;color:#ffffff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px;vertical-align:middle;">${escapeHtml(insights.band)}</span>
                      </div>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eeeeee;border-radius:999px;">
                        <tr><td width="${pct}%" style="background-color:#e41f26;height:8px;border-radius:999px;font-size:0;line-height:0;">&nbsp;</td><td style="font-size:0;line-height:0;">&nbsp;</td></tr>
                      </table>
                      <div style="font-size:12px;color:#9a9a9a;margin-top:8px;">A rough guide based on what you shared today — not a test result.</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 24px;border-bottom:1px solid #e3e3e3;">
                      <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#1a7f45;text-transform:uppercase;margin-bottom:6px;">Strengths</div>
                      ${list(insights.strengths, "&#10003;", "#1a7f45")}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 24px;${programs.length ? "border-bottom:1px solid #e3e3e3;" : ""}">
                      <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#e41f26;text-transform:uppercase;margin-bottom:6px;">Gaps to close</div>
                      ${list(insights.gaps, "&#8226;", "#e41f26")}
                    </td>
                  </tr>
                  ${
                    programs.length
                      ? `<tr>
                    <td style="padding:20px 24px;">
                      <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#603e3a;text-transform:uppercase;margin-bottom:8px;">Programs that fit you</div>
                      ${programs
                        .map(
                          (p, i) => `<div style="padding:6px 0;font-size:15px;color:#1a1c1c;"><span style="color:#e41f26;">${i === 0 ? "&#9733;" : "&#9734;"}</span>&nbsp; <strong>${escapeHtml(p.name)}</strong>${p.duration ? ` <span style="color:#9a9a9a;font-size:13px;">· ${escapeHtml(p.duration)}</span>` : ""}${i === 0 ? ` <span style="color:#e41f26;font-size:12px;font-weight:700;">Top pick</span>` : ""}</div>`,
                        )
                        .join("")}
                    </td>
                  </tr>`
                      : ""
                  }
                </table>`;
}

export function sessionSummaryHtml({
  studentName,
  programName,
  programDuration,
  counsellorName,
  feedbackUrl,
  insights = null,
  programs = [],
  brochureAttached = false,
}: {
  studentName: string;
  programName: string | null;
  programDuration: string | null;
  counsellorName: string | null;
  feedbackUrl: string | null;
  insights?: LearnerInsights | null;
  programs?: EmailProgram[];
  brochureAttached?: boolean;
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
${insights ? diagnosticHtml(insights, programs) : ""}
                <div style="font-size:12px;font-weight:700;letter-spacing:1px;color:#1a1c1c;text-transform:uppercase;margin-bottom:10px;">
                  What happens next
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                  ${["Our team will reach out to you shortly with the next steps.", brochureAttached ? "The program brochure is attached to this email — have a look." : "You'll receive the detailed program brochure and batch schedule.", "Keep an eye on your phone and inbox for a call from our admissions team."]
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
                  feedbackUrl
                    ? `<div style="margin-bottom:28px;padding:20px;background-color:#faf3f3;border-radius:10px;text-align:center;">
                  <div style="font-size:12px;font-weight:700;letter-spacing:1px;color:#1a1c1c;text-transform:uppercase;margin-bottom:6px;">
                    How was your session?
                  </div>
                  <div style="font-size:13px;color:#603e3a;margin-bottom:10px;">Tap a star to rate it — it takes a second.</div>
                  <div style="font-size:34px;line-height:1;letter-spacing:4px;">
                    ${[1, 2, 3, 4, 5].map((n) => `<a href="${escapeHtml(feedbackUrl)}?rating=${n}" style="color:#e41f26;text-decoration:none;" title="${n} star${n === 1 ? "" : "s"}">&#9733;</a>`).join("")}
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
  feedbackUrl: string | null;
  insights?: LearnerInsights | null;
  programs?: EmailProgram[];
  brochure?: { url: string; filename: string } | null;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn("sendSessionSummaryEmail: RESEND_API_KEY or EMAIL_FROM not configured — skipping send.");
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const send = (withBrochure: boolean) =>
      resend.emails.send({
        from,
        to: params.to,
        subject: `Your upGrad X counselling session — ${params.programName ?? "recap"}`,
        html: sessionSummaryHtml({ ...params, brochureAttached: withBrochure }),
        attachments: withBrochure && params.brochure ? [{ filename: params.brochure.filename, path: params.brochure.url }] : undefined,
      });
    let { error } = await send(!!params.brochure);
    // A brochure that can't be fetched shouldn't cost the learner their recap.
    if (error && params.brochure) {
      console.error("sendSessionSummaryEmail with brochure failed, retrying without:", error);
      ({ error } = await send(false));
    }
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
