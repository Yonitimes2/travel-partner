import { dictionaries } from "../i18n";
import type { Email } from "./email";
import type { ServerUser } from "./repo";
import type { Gender, JoinRequest, Lang, ReportReason, Trip } from "../types";

/**
 * The emails, in Hebrew and English. Hebrew is written for the reader's gender (and the gender of the
 * person written about), which the app always knows.
 */

const appUrl = () => (process.env.APP_URL || "http://localhost:3221").replace(/\/$/, "");
const link = (lang: Lang, path: string) => `${appUrl()}/${lang}${path === "/" ? "" : path}`;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** male / female wording */
const g = (gender: Gender, male: string, female: string) => (gender === "male" ? male : female);

interface Parts {
  lang: Lang;
  subject: string;
  title: string;
  lines: string[];
  /** a quoted text the person wrote (a request note, a chat message) */
  quote?: string;
  /** a big code to type */
  code?: string;
  button?: { text: string; url: string };
  /** why this email came: "notifications" (can be turned off) or a plain line */
  footer: "notifications" | "account";
}

const FOOTER = {
  he: {
    notifications: "קיבלת את המייל הזה כי התראות המייל פעילות. אפשר לכבות אותן בפרופיל באפליקציה.",
    account: "מייל אוטומטי מהאפליקציה, אין צורך להשיב לו.",
  },
  en: {
    notifications: "You got this email because email notifications are on. You can turn them off in your profile in the app.",
    account: "An automatic email from the app; there's no need to reply.",
  },
};

function render(p: Parts, to: string): Email {
  const t = dictionaries[p.lang];
  const rtl = p.lang === "he";
  const align = rtl ? "right" : "left";
  const body = p.lines.map((l) => `<p style="margin:0 0 12px">${esc(l)}</p>`).join("");
  const quote = p.quote
    ? `<p style="margin:4px 0 16px;padding:10px 14px;background:#f2f5fa;border-${rtl ? "right" : "left"}:3px solid #2563eb;border-radius:8px;white-space:pre-line">${esc(p.quote)}</p>`
    : "";
  const code = p.code
    ? `<p dir="ltr" style="margin:8px 0 16px;font-size:36px;font-weight:bold;letter-spacing:10px;color:#0b1d4d;text-align:center">${esc(p.code)}</p>`
    : "";
  const button = p.button
    ? `<p style="margin:20px 0 4px"><a href="${esc(p.button.url)}" style="display:inline-block;background:#0b1d4d;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:14px;font-weight:bold">${esc(p.button.text)}</a></p>`
    : "";

  const html = `<!doctype html>
<html lang="${p.lang}" dir="${rtl ? "rtl" : "ltr"}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.subject)}</title></head>
<body style="margin:0;padding:0;background:#f2f5fa">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f5fa;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;font-family:Arial,Helvetica,sans-serif">
<tr><td style="background:#0b1d4d;padding:18px 24px;color:#ffffff;font-size:18px;font-weight:bold;text-align:${align}">${esc(t.appName)}</td></tr>
<tr><td dir="${rtl ? "rtl" : "ltr"}" style="padding:24px;color:#0f1b3d;font-size:16px;line-height:1.6;text-align:${align}">
<h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;color:#0b1d4d">${esc(p.title)}</h1>
${body}${code}${quote}${button}
</td></tr>
<tr><td dir="${rtl ? "rtl" : "ltr"}" style="padding:14px 24px 18px;border-top:1px solid #e2e7f1;color:#66708a;font-size:12px;line-height:1.5;text-align:${align}">${esc(FOOTER[p.lang][p.footer])}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    p.title,
    "",
    ...p.lines,
    ...(p.code ? ["", p.code] : []),
    ...(p.quote ? ["", `"${p.quote}"`] : []),
    ...(p.button ? ["", `${p.button.text}: ${p.button.url}`] : []),
    "",
    "—",
    FOOTER[p.lang][p.footer],
  ].join("\n");

  return { to, subject: p.subject, html, text };
}

/** only when the person keeps email notifications on */
const ifWanted = (user: ServerUser, parts: Parts): Email | null => (user.notify.email ? render(parts, user.email) : null);

// ---------- sign-in ----------

export function codeEmail(to: string, code: string, lang: Lang): Email {
  return render(
    lang === "he"
      ? {
          lang,
          subject: `קוד הכניסה: ${code}`,
          title: "קוד הכניסה לשותף לדרך",
          lines: ["זה הקוד להקליד באפליקציה. הוא בתוקף ל־10 דקות.", "אם לא ביקשת קוד, אפשר להתעלם מהמייל."],
          code,
          footer: "account",
        }
      : {
          lang,
          subject: `Your sign-in code: ${code}`,
          title: "Your Travel Partner sign-in code",
          lines: ["Type this code in the app. It works for 10 minutes.", "If you didn't ask for a code, you can ignore this email."],
          code,
          footer: "account",
        },
    to,
  );
}

// ---------- requests ----------

/** to the trip's owner: someone asked to join */
export function newRequestEmail(owner: ServerUser, from: ServerUser, trip: Trip, request: JoinRequest): Email | null {
  const t = dictionaries[owner.lang];
  const who = t.partyText(request.party);
  if (owner.lang === "he") {
    return ifWanted(owner, {
      lang: "he",
      subject: `בקשה חדשה להצטרף ל${trip.place}`,
      title: `${from.nickname} ${g(from.gender, "מבקש", "מבקשת")} להצטרף לטיול שלך`,
      lines: [
        `${trip.place} · ${g(from.gender, "מגיע", "מגיעה")} ${who}.`,
        ...(trip.kind === "planned" ? ["הטיול עדיין בתכנון: כדי לראות את הפרופיל המלא ולאשר, צריך לסגור את הטיול."] : []),
      ],
      quote: request.note || undefined,
      button: { text: "לבקשות שלי", url: link("he", "/my") },
      footer: "notifications",
    });
  }
  return ifWanted(owner, {
    lang: "en",
    subject: `New request to join ${trip.place}`,
    title: `${from.nickname} asked to join your trip`,
    lines: [
      `${trip.place} · coming ${who}.`,
      ...(trip.kind === "planned" ? ["The trip is still planned: close it to see the full profile and accept."] : []),
    ],
    quote: request.note || undefined,
    button: { text: "See my requests", url: link("en", "/my") },
    footer: "notifications",
  });
}

/** to the person who asked: the owner answered */
export function answeredEmail(to: ServerUser, owner: ServerUser, trip: Trip, request: JoinRequest): Email | null {
  const accepted = request.status === "accepted";
  if (to.lang === "he") {
    return ifWanted(
      to,
      accepted
        ? {
            lang: "he",
            subject: `${owner.nickname} ${g(owner.gender, "אישר", "אישרה")} את הבקשה שלך`,
            title: `יוצאים לדרך: ${trip.place}`,
            lines: [`${owner.nickname} ${g(owner.gender, "אישר", "אישרה")} את הבקשה שלך להצטרף. הצ'אט ביניכם פתוח עכשיו באפליקציה.`],
            button: { text: "לצ'אט", url: link("he", `/chat/${request.id}`) },
            footer: "notifications",
          }
        : {
            lang: "he",
            subject: `הבקשה להצטרף ל${trip.place}`,
            title: "הפעם זה לא הסתדר",
            lines: [`הבקשה שלך להצטרף ל${trip.place} לא אושרה. יש עוד טיולים במדור שמחכים לשותפים.`],
            button: { text: "לטיולים", url: link("he", "/") },
            footer: "notifications",
          },
    );
  }
  return ifWanted(
    to,
    accepted
      ? {
          lang: "en",
          subject: `${owner.nickname} accepted your request`,
          title: `You're going: ${trip.place}`,
          lines: [`${owner.nickname} accepted your request to join. Your chat is open in the app now.`],
          button: { text: "Open the chat", url: link("en", `/chat/${request.id}`) },
          footer: "notifications",
        }
      : {
          lang: "en",
          subject: `Your request to join ${trip.place}`,
          title: "Not this time",
          lines: [`Your request to join ${trip.place} wasn't accepted. There are more trips in your section looking for partners.`],
          button: { text: "Browse trips", url: link("en", "/") },
          footer: "notifications",
        },
  );
}

/** to the other side of a chat (at most one an hour per chat; see actions.ts) */
export function messageEmail(to: ServerUser, from: ServerUser, trip: Trip, request: JoinRequest, text: string): Email | null {
  if (to.lang === "he") {
    return ifWanted(to, {
      lang: "he",
      subject: `הודעה חדשה מ${from.nickname}`,
      title: `${from.nickname} ${g(from.gender, "כתב", "כתבה")} לך`,
      lines: [`בצ'אט על ${trip.place}:`],
      quote: text,
      button: { text: "לתשובה בצ'אט", url: link("he", `/chat/${request.id}`) },
      footer: "notifications",
    });
  }
  return ifWanted(to, {
    lang: "en",
    subject: `New message from ${from.nickname}`,
    title: `${from.nickname} wrote to you`,
    lines: [`In your chat about ${trip.place}:`],
    quote: text,
    button: { text: "Reply in the chat", url: link("en", `/chat/${request.id}`) },
    footer: "notifications",
  });
}

// ---------- sign-up and approval ----------

/** to the section's admins: someone signed up and waits for approval */
export function signupEmail(admin: ServerUser, user: ServerUser, referrer: ServerUser | null): Email | null {
  const t = dictionaries[admin.lang];
  const referral = user.referral ? `${user.referral.name} (${user.referral.phone})` : "";
  if (admin.lang === "he") {
    return ifWanted(admin, {
      lang: "he",
      subject: `${g(user.gender, "נרשם חדש ממתין", "נרשמה חדשה ממתינה")} לאישור`,
      title: `${user.nickname} ${g(user.gender, "נרשם", "נרשמה")} ל${t.section[user.gender]}`,
      lines: [
        `${user.fullName}${user.city ? `, ${user.city}` : ""}.`,
        referrer ? `בהמלצת ${referral}.` : "בלי ממליץ מהקהילה (המדור עוד ריק), צריך לבדוק לפני שמאשרים.",
      ],
      button: { text: "להנהלת המדור", url: link("he", "/admin") },
      footer: "notifications",
    });
  }
  return ifWanted(admin, {
    lang: "en",
    subject: "A new member is waiting for approval",
    title: `${user.nickname} signed up to the ${t.section[user.gender]}`,
    lines: [
      `${user.fullName}${user.city ? `, ${user.city}` : ""}.`,
      referrer ? `Recommended by ${referral}.` : "No recommender from the community (the section is still empty); check before approving.",
    ],
    button: { text: "Open the admin page", url: link("en", "/admin") },
    footer: "notifications",
  });
}

/** to the recommender: their name was given at sign-up (always sent: it's about them) */
export function referrerEmail(referrer: ServerUser, user: ServerUser): Email {
  const he = referrer.lang === "he";
  // the recommender is from the same section, so both have the same gender
  return render(
    he
      ? {
          lang: "he",
          subject: `${user.fullName} ${g(user.gender, "ציין", "ציינה")} ${g(referrer.gender, "אותך כממליץ", "אותך כממליצה")}`,
          title: `${g(referrer.gender, "אתה ממליץ", "את ממליצה")} על ${user.fullName}?`,
          lines: [
            `${user.fullName} ${g(user.gender, "נרשם", "נרשמה")} לשותף לדרך וכתב${g(user.gender, "", "ה")} ${g(referrer.gender, "שאתה ממליץ עליו", "שאת ממליצה עליה")}.`,
            `הנהלת המדור עשויה ליצור איתך קשר כדי לוודא. ${g(referrer.gender, "אם אתה לא מכיר אותו", "אם את לא מכירה אותה")}, אפשר לומר להם את זה.`,
          ],
          footer: "account",
        }
      : {
          lang: "en",
          subject: `${user.fullName} named you as their recommender`,
          title: `Do you recommend ${user.fullName}?`,
          lines: [
            `${user.fullName} signed up to Travel Partner and wrote that you recommend them.`,
            "The section's admins may contact you to check. If you don't know them, you can tell the admins.",
          ],
          footer: "account",
        },
    referrer.email,
  );
}

/** to someone the section's admins approved (always sent) */
export function approvedEmail(user: ServerUser): Email {
  return render(
    user.lang === "he"
      ? {
          lang: "he",
          subject: "ההרשמה אושרה",
          title: `${g(user.gender, "ברוך הבא", "ברוכה הבאה")} לשותף לדרך!`,
          lines: [`ההרשמה שלך אושרה. אפשר להיכנס, לראות את הטיולים ב${dictionaries.he.section[user.gender]} ולפרסם טיול משלך.`],
          button: { text: "כניסה לאפליקציה", url: link("he", "/") },
          footer: "account",
        }
      : {
          lang: "en",
          subject: "You're approved",
          title: "Welcome to Travel Partner!",
          lines: [`Your sign-up was approved. Come in to see the trips in the ${dictionaries.en.section[user.gender]} and post your own.`],
          button: { text: "Open the app", url: link("en", "/") },
          footer: "account",
        },
    user.email,
  );
}

/** to the section's admins: someone reported a member */
export function reportEmail(admin: ServerUser, from: ServerUser, about: ServerUser, reason: ReportReason, text: string): Email | null {
  const t = dictionaries[admin.lang];
  if (admin.lang === "he") {
    return ifWanted(admin, {
      lang: "he",
      subject: `דיווח חדש על ${about.nickname}`,
      title: `${from.nickname} ${g(from.gender, "דיווח", "דיווחה")} על ${about.nickname}`,
      lines: [`הסיבה: ${t.moderation.reason[reason]}.`],
      quote: text || undefined,
      button: { text: "לדיווחים", url: link("he", "/admin") },
      footer: "notifications",
    });
  }
  return ifWanted(admin, {
    lang: "en",
    subject: `New report about ${about.nickname}`,
    title: `${from.nickname} reported ${about.nickname}`,
    lines: [`Reason: ${t.moderation.reason[reason]}.`],
    quote: text || undefined,
    button: { text: "See reports", url: link("en", "/admin") },
    footer: "notifications",
  });
}
