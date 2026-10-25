import type {
  AgeGroup,
  Area,
  Gender,
  Observance,
  Pace,
  ReportReason,
  RequestStatus,
  Party,
  TripKind,
  TripStyle,
  Wanted,
} from "../types";
import type { Tier } from "../rules";
import { durationParts, type DurationUnit } from "../dates";

/** "יום", "יומיים", "3 ימים"; "שבוע", "שבועיים"; "חודש", "חודשיים" */
const unitText = (unit: DurationUnit, n: number) =>
  unit === "days"
    ? n === 1 ? "יום" : n === 2 ? "יומיים" : `${n} ימים`
    : unit === "weeks"
      ? n === 1 ? "שבוע" : n === 2 ? "שבועיים" : `${n} שבועות`
      : n === 1 ? "חודש" : n === 2 ? "חודשיים" : `${n} חודשים`;

/** "ושבוע", but "ו־3 ימים" before a number */
const and = (text: string) => (/^\d/.test(text) ? `ו־${text}` : `ו${text}`);

/** "שבועיים ויום", "חודש ושבועיים", "8 ימים" */
const duration = (days: number) => {
  const parts = durationParts(days);
  if (parts.length === 1 && parts[0].unit === "days" && parts[0].n === 1) return "יום אחד";
  return parts.map((p, i) => (i ? and(unitText(p.unit, p.n)) : unitText(p.unit, p.n))).join(" ");
};

/** Hebrew is the source dictionary: English must have the same shape (see en.ts) */
export const he = {
  appName: "שותף לדרך",

  duration,
  /** for the big countdown: the number, and the words that go under it ("חודשים ושבוע") */
  countdown: (days: number) => {
    const [first, ...rest] = durationParts(days);
    const word = { days: first.n === 1 ? "יום" : "ימים", weeks: first.n === 1 ? "שבוע" : "שבועות", months: first.n === 1 ? "חודש" : "חודשים" }[first.unit];
    return { n: first.n, label: [word, ...rest.map((p) => and(unitText(p.unit, p.n)))].join(" ") };
  },
  tagline: "יוצאים לטיול? מוצאים שותפים לדרך",

  greeting: {
    morning: (name: string) => `בוקר טוב, ${name}`,
    noon: (name: string) => `צהריים טובים, ${name}`,
    evening: (name: string) => `ערב טוב, ${name}`,
  },

  home: {
    headline: "לאן יוצאים הפעם?",
    all: "הכול",
  },

  nav: {
    trips: "טיולים",
    my: "הטיולים שלי",
    new: "פרסום",
    chats: "שיחות",
    profile: "פרופיל",
  },

  section: {
    male: "מדור גברים",
    female: "מדור נשים",
  } satisfies Record<Gender, string>,
  /** "will be posted in the men's section" */
  postedIn: {
    male: "במדור הגברים",
    female: "במדור הנשים",
  } satisfies Record<Gender, string>,
  bothSections: "בשני המדורים",

  demo: {
    banner: "אב־טיפוס · נתוני דוגמה",
    viewAs: "צפייה בתור",
    tools: "כלים לאב־טיפוס",
    reset: "איפוס נתוני הדוגמה",
    resetDone: "הנתונים אופסו",
    simulateAccept: "דמו: לדמות אישור של בעל/ת הטיול",
    signUp: "תהליך ההרשמה",
    admin: "מסך הנהלת המדור",
  },

  gender: {
    male: "גבר",
    female: "אישה",
  } satisfies Record<Gender, string>,

  kind: {
    planned: "בתכנון",
    closed: "סגור",
  } satisfies Record<TripKind, string>,
  kindTab: {
    planned: "בתכנון",
    closed: "סגורים",
  } satisfies Record<TripKind, string>,
  kindHint: {
    planned: "רעיונות לטיול שיוצאים לפועל אם יימצאו שותפים",
    closed: "טיולים שיוצאים בוודאות — אפשר להצטרף אם מתאים",
  } satisfies Record<TripKind, string>,

  area: {
    north: "צפון",
    center: "מרכז",
    jerusalem: "ירושלים",
    south: "דרום ואילת",
    europe: "אירופה",
    usa: "ארה״ב",
    asia: "אסיה",
    other: "אחר",
  } satisfies Record<Area, string>,

  /** who the poster is looking for, in the section's own grammatical gender */
  wanted: {
    male: { one: "שותף אחד", few: "כמה שותפים", families: "משפחות" },
    female: { one: "שותפה אחת", few: "כמה שותפות", families: "משפחות" },
  } satisfies Record<Gender, Record<Wanted, string>>,

  style: {
    hiking: "מסלולי הליכה",
    nature: "טבע",
    cities: "ערים",
    relaxed: "רגוע",
    adventure: "אתגרי",
    shabbat: "שבת בטיול",
    food: "אוכל כשר",
  } satisfies Record<TripStyle, string>,

  /** who someone travels with */
  partyType: {
    solo: "לבד",
    group: "עם עוד אנשים",
    family: "משפחה",
  } satisfies Record<Party["type"], string>,
  /** "לבד", "עם עוד 2 אנשים", "משפחה: 2 הורים ו־3 ילדים" */
  partyText: (p: Party) => {
    if (p.type === "solo") return "לבד";
    if (p.type === "group") return p.others <= 0 ? "עם עוד אנשים" : p.others === 1 ? "עם עוד אדם אחד" : `עם עוד ${p.others} אנשים`;
    const parents = p.parents === 1 ? "הורה" : "2 הורים";
    return p.kids === 0 ? `משפחה: ${parents}` : p.kids === 1 ? `משפחה: ${parents} וילד אחד` : `משפחה: ${parents} ו־${p.kids} ילדים`;
  },
  partyForm: {
    others: "כמה אנשים נוספים (לא חובה)",
    note: "הערה (לא חובה)",
    notePlaceholder: "למשל: שני חברים מהקהילה",
    parents: "הורים",
    oneParent: "הורה אחד",
    twoParents: "2 הורים",
    kids: "ילדים",
  },

  ageGroup: {
    "18-25": "18–25",
    "26-35": "26–35",
    "36-50": "36–50",
    "50+": "50+",
  } satisfies Record<AgeGroup, string>,
  ageLabel: (group: string) => `גיל ${group}`,

  observance: {
    strict: "מהדרין",
    kosher: "כשרות ושבת",
    traditional: "מסורתי",
  } satisfies Record<Observance, string>,

  pace: {
    easy: "קצב קל",
    medium: "קצב בינוני",
    hard: "קצב מאתגר",
  } satisfies Record<Pace, string>,

  tier: {
    bronze: "ברונזה",
    silver: "כסף",
    gold: "זהב",
  } satisfies Record<Tier, string>,
  points: (n: number) => `${n} נק׳`,
  stats: (trips: number, joined: number) => `${trips} טיולים · ${joined} מצטרפים`,
  pointsTitle: "נקודות",
  statLabel: { trips: "טיולים", joined: "מצטרפים" },
  pointsExplain: "נקודות על טיולים שאנשים הצטרפו אליהם: 10 לכל טיול ו־5 לכל מצטרף. בהמשך — פרסים לחו״ל.",

  feed: {
    area: "אזור",
    allAreas: "כל האזורים",
    wanted: "מחפשים",
    anyWanted: "כולם",
    month: "מתי",
    anyMonth: "כל התאריכים",
    count: (n: number) => (n === 1 ? "טיול אחד" : `${n} טיולים`),
    empty: "אין כרגע טיולים שמתאימים לסינון",
    clear: "ניקוי סינון",
  },

  trip: {
    depart: "יציאה",
    return: "חזרה",
    toGo: "ליציאה",
    toGoAbout: "ליציאה, בערך",
    openUntil: (date: string) => `פתוח להצטרפות עד ${date}`,
    closesIn: (n: number) => (n <= 0 ? "נסגר היום" : n === 1 ? "נסגר מחר" : `עוד ${duration(n)}`),
    daysBefore: (n: number) => `עד ${duration(n)} לפני היציאה`,
    or: (date: string) => `או ${date}`,
    plusMinus: (days: number) => `± ${duration(days)}`,
    notFinal: "תאריכים לא סופיים",
    flexible: "תאריכים גמישים",
    about: "על הטיול",
    lookingFor: "מחפשים",
    style: "סגנון",
    postedBy: "פורסם על ידי",
    askToJoin: "בקשה להצטרף",
    contactRule: "השיחה נפתחת רק אחרי שהבקשה מאושרת. פרטי קשר לא מוצגים.",
    requestPending: "הבקשה נשלחה וממתינה לאישור",
    requestAccepted: "הבקשה אושרה — אפשר לדבר",
    requestDeclined: "הבקשה לא אושרה",
    openChat: "לשיחה",
    yours: "זה טיול שפרסמת",
    manage: "לבקשות",
    closedToRequests: "ההצטרפות לטיול הזה נסגרה",
    full: "נמצאו שותפים",
    notFound: "הטיול לא נמצא",
    back: "חזרה",
    requests: (n: number) => (n === 1 ? "בקשה אחת" : `${n} בקשות`),
    families: "טיול משפחות",
    edit: "עריכה",
  },

  join: {
    title: "בקשה להצטרף",
    noteLabel: "הודעה קצרה עם הבקשה",
    notePlaceholder: "למשל: שני אחים מירושלים, מטיילים בקצב רגוע",
    familiesHint: "טיול משפחות — כדאי לבחור 'משפחה' ולציין מי מצטרף",
    party: "מי מצטרף?",
    plannedNote: "הטיול עדיין בתכנון. הבקשה תחכה עד שהטיול ייסגר ויאושר.",
    send: "שליחת הבקשה",
    cancel: "ביטול",
    sent: "הבקשה נשלחה",
  },

  newTrip: {
    title: "פרסום טיול",
    editTitle: "עריכת טיול",
    kindQuestion: "איזה טיול?",
    plannedTitle: "טיול בתכנון",
    plannedDesc: "רעיון שיוצא לפועל אם יימצאו שותפים",
    free: "חינם",
    plannedLimitReached: "כבר יש 2 טיולים בתכנון. אפשר לסגור אחד מהם או לפרסם טיול סגור.",
    closedTitle: "טיול סגור",
    closedDesc: "יוצאים בוודאות — אפשר לאשר מצטרפים",
    betaFree: "חינם בבטא",
    stayClosed: "טיול שנסגר נשאר סגור",
    place: "לאן?",
    placePlaceholder: "למשל: הדולומיטים, צפון איטליה",
    area: "אזור",
    pickArea: "בחירת אזור",
    cover: "תמונת כיסוי",
    from: "יציאה",
    to: "חזרה",
    flexTitle: "עד כמה התאריכים סגורים?",
    flex: {
      fixed: "רק התאריכים האלה",
      alt: "יש תאריך יציאה נוסף",
      range: "גמיש בכמה ימים או שבועות",
    },
    altDate: "תאריך יציאה נוסף",
    altReturn: (date: string) => `וחזרה ב־${date}`,
    rangeLabel: "גמיש בטווח של, לפני או אחרי",
    unit: { days: "ימים", weeks: "שבועות" },
    wanted: "את מי מחפשים?",
    familiesNote: "טיול משפחות מופיע במדור הגברים ובמדור הנשים",
    styles: "סגנון הטיול (אפשר לבחור כמה)",
    description: "תיאור",
    descriptionPlaceholder: "מה מתוכנן, קצב, רמת קושי, שבת, אוכל…",
    deadline: "עד מתי מחפשים שותפים?",
    deadlineDate: "עד תאריך",
    deadlineDays: "ימים לפני היציאה",
    daysBeforeSuffix: "ימים לפני היציאה",
    postedIn: (where: string) => `הטיול יפורסם ${where}`,
    publish: "פרסום הטיול",
    save: "שמירת השינויים",
    toPayment: "המשך לסגירת הטיול",
    published: "הטיול פורסם",
    saved: "השינויים נשמרו",
    errors: {
      place: "צריך לכתוב לאן",
      area: "צריך לבחור אזור",
      dates: "צריך לבחור תאריכים",
      order: "תאריך החזרה לפני תאריך היציאה",
      past: "תאריך היציאה כבר עבר",
      deadline: "המועד האחרון צריך להיות מהיום ועד היציאה",
      alt: "צריך תאריך יציאה נוסף — שונה מהראשון, ולא בעבר",
    },
  },

  payment: {
    title: "סגירת הטיול",
    explain: "בטיול סגור רואים את הפרטים המלאים של מי שמבקש להצטרף, ואפשר לאשר אותם. כל מצטרף מוסיף לך נקודות.",
    once: "תשלום חד־פעמי לטיול",
    beta: "בתקופת הבטא — חינם",
    demo: "זה אב־טיפוס — לא יתבצע שום חיוב.",
    payBeta: "סגירת הטיול — חינם בבטא",
    back: "חזרה",
    done: "הטיול נסגר — אפשר לאשר מצטרפים",
  },

  my: {
    title: "הטיולים שלי",
    posts: "שפרסמתי",
    sent: "בקשות ששלחתי",
    incoming: "בקשות להצטרפות",
    noRequests: "עדיין אין בקשות",
    accept: "אישור",
    decline: "דחייה",
    status: {
      pending: "ממתינה",
      accepted: "אושרה",
      declined: "נדחתה",
    } satisfies Record<RequestStatus, string>,
    emptyPosts: "עוד לא פרסמת טיול",
    postTrip: "לפרסום טיול",
    emptySent: "עוד לא שלחת בקשות להצטרף",
    browse: "לחיפוש טיולים",
    notOpen: "לא פתוח לבקשות",
    locked: "הפרטים המלאים נפתחים כשהטיול נסגר",
    unlock: "לסגור את הטיול ולאשר מצטרפים",
    foundPartners: "מצאתי שותפים",
    reopen: "לפתוח שוב לבקשות",
    delete: "מחיקה",
    confirmDelete: "למחוק את הטיול? הבקשות והשיחות שלו יימחקו.",
    deleted: "הטיול נמחק",
  },

  chat: {
    title: "שיחות",
    empty: "אין עדיין שיחות. שיחה נפתחת כשבקשת הצטרפות מאושרת.",
    about: (place: string) => `על הטיול: ${place}`,
    acceptedLine: "הבקשה אושרה — מכאן אפשר לדבר",
    safety: "בפגישה הראשונה נפגשים במקום ציבורי",
    safetyLink: "טיפים לבטיחות",
    placeholder: "כתיבת הודעה…",
    send: "שליחה",
    locked: "אין גישה לשיחה הזו",
  },

  moderation: {
    menu: "אפשרויות",
    report: "דיווח",
    block: "חסימה",
    reportTitle: (name: string) => `דיווח על ${name}`,
    reason: {
      behavior: "התנהגות לא הולמת",
      fake: "פרופיל מזויף או מדור לא נכון",
      spam: "ספאם או פרסום",
      other: "אחר",
    } satisfies Record<ReportReason, string>,
    details: "פרטים (לא חובה)",
    sendReport: "שליחת הדיווח",
    reported: "הדיווח נשלח להנהלת המדור",
    blockConfirm: (name: string) => `לחסום את ${name}? לא תראו זה את זה, והשיחה תיסגר.`,
    blocked: "החסימה בוצעה",
    cancel: "ביטול",
  },

  profile: {
    title: "פרופיל",
    nickname: "כינוי",
    avatar: "דמות",
    gender: "מדור",
    genderLocked: "נקבע בהרשמה ואי אפשר לשנות",
    party: "עם מי מטיילים",
    fullName: "שם מלא",
    phone: "טלפון",
    privateTitle: "פרטים אישיים",
    privateNote: "לא מוצגים לאף אחד — רק להנהלת המדור",
    phoneVerified: "אומת ב־SMS",
    ageGroup: "שכבת גיל",
    observance: "רמת הקפדה",
    pace: "קצב וכושר",
    city: "עיר",
    about: "קצת עליי",
    save: "שמירה",
    saved: "נשמר",
    notifications: "התראות",
    push: "התראות לטלפון",
    email: "מייל",
    language: "שפה",
    safety: "בטיחות ותקנון",
  },

  welcome: {
    title: "מוצאים שותפים לדרך",
    subtitle: "קהילת טיולים דתית, עם מדור לגברים ומדור לנשים",
    start: "להרשמה",
    inviteOnly: "ההצטרפות לקהילה בהמלצה של מישהו שכבר בפנים",
    step: (n: number, total: number) => `שלב ${n} מתוך ${total}`,
    phoneTitle: "מה מספר הטלפון?",
    phoneHint: "נשלח קוד ב־SMS. המספר לא מוצג לאף אחד.",
    phone: "טלפון",
    sendCode: "שליחת קוד",
    codeTitle: "הקוד שקיבלת",
    codeHint: (phone: string) => `שלחנו קוד ל־${phone}`,
    demoCode: "בדמו: כל קוד של 4 ספרות",
    verify: "אימות",
    aboutTitle: "קצת עליך",
    genderWarn: "אי אפשר לשנות אחר כך",
    styleTitle: "איך מטיילים?",
    referralTitle: "מי ממליץ עליך?",
    referralHint:
      "מישהו מהקהילה, מאותו מדור. צריך לכתוב את השם המלא ואת מספר הטלפון של מי שממליץ, כדי שהנהלת המדור תוכל לבדוק את ההמלצה.",
    referralName: "שם מלא של מי שממליץ",
    referralPhone: "הטלפון של מי שממליץ",
    referralNotFound: "המספר הזה לא רשום אצלנו במדור",
    referralExamples: (names: string) => `בדמו אפשר: ${names}`,
    fullNameHint: "לא מוצג לאף אחד — רק להנהלת המדור",
    submit: "שליחה לאישור",
    pendingTitle: "ההרשמה נשלחה!",
    pendingText: (name: string) =>
      `שלחנו ל${name} בקשה להמליץ עליך. אחרי זה הנהלת המדור תאשר את ההרשמה, ונשלח לך הודעה.`,
    demoApprove: "דמו: לאשר ולהיכנס",
    next: "המשך",
    back: "חזרה",
    errors: {
      phone: "צריך מספר טלפון תקין",
      code: "צריך 4 ספרות",
      nickname: "צריך כינוי",
      fullName: "צריך שם מלא — שם פרטי ושם משפחה",
      gender: "צריך לבחור מדור",
    },
  },

  admin: {
    title: "הנהלת המדור",
    pending: "ממתינים",
    reports: "דיווחים",
    users: "משתמשים",
    recommendedBy: (name: string) => `בהמלצת ${name}`,
    approve: "אישור",
    reject: "דחייה",
    noPending: "אין נרשמים שממתינים לאישור",
    noReports: "אין דיווחים פתוחים",
    reportOf: (from: string, about: string) => `${from} דיווח/ה על ${about}`,
    suspend: "השעיה",
    restore: "החזרה",
    dismiss: "סגירת הדיווח",
    suspended: "מושעה",
    approved: "המשתמש אושר",
    privateDetails: "פרטים להנהלה",
    referral: "ההמלצה",
    typedName: (name: string) => `נכתב: ${name}`,
    nameMatches: "תואם לשם הרשום",
    nameDiffers: (registered: string) => `לא תואם לשם הרשום (${registered})`,
    call: "התקשרות",
  },

  safety: {
    title: "בטיחות ותקנון",
    tipsTitle: "לפני שיוצאים עם שותפים חדשים",
    tips: [
      "את השיחה הראשונה מנהלים כאן באפליקציה, בלי למסור טלפון או כתובת.",
      "בפגישה הראשונה נפגשים במקום ציבורי, ביום.",
      "מספרים למישהו קרוב לאן יוצאים, עם מי ומתי חוזרים.",
      "לא מעבירים כסף מראש למי שלא מכירים.",
      "משהו לא מרגיש נכון? אפשר לחסום ולדווח, והנהלת המדור בודקת כל דיווח.",
    ],
    photosTitle: "צילומים",
    photosText: "התמונות באדיבות צלמי Unsplash, ברישיון שמתיר שימוש חופשי.",
    termsTitle: "תקנון ומדיניות פרטיות",
    termsText: "הנוסח המלא ייכתב לפני ההשקה, בליווי עורך דין.",
  },

  langSwitch: "English",
};

export type Dict = typeof he;
