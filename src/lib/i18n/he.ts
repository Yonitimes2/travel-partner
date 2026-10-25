import type { Area, Gender, RequestStatus, TravelsAs, TripKind, TripStyle, Wanted } from "../types";

/** Hebrew is the source dictionary: English must have the same shape (see en.ts) */
export const he = {
  appName: "שותף לדרך",
  tagline: "יוצאים לטיול? מוצאים שותפים לדרך",

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

  demo: {
    banner: "אב־טיפוס · נתוני דוגמה",
    viewAs: "צפייה בתור",
    tools: "כלים לאב־טיפוס",
    reset: "איפוס נתוני הדוגמה",
    resetDone: "הנתונים אופסו",
    simulateAccept: "דמו: לדמות אישור של בעל/ת הטיול",
  },

  gender: {
    male: "גבר",
    female: "אישה",
  } satisfies Record<Gender, string>,

  kind: {
    planned: "בתכנון",
    booked: "הוזמן",
  } satisfies Record<TripKind, string>,
  kindTab: {
    planned: "בתכנון",
    booked: "הוזמנו",
  } satisfies Record<TripKind, string>,
  kindHint: {
    planned: "רעיונות לטיול שיוצאים לפועל אם יימצאו שותפים",
    booked: "טיולים שכבר הוזמנו — אפשר להצטרף אם מתאים",
  } satisfies Record<TripKind, string>,

  area: {
    north: "צפון",
    center: "מרכז",
    jerusalem: "ירושלים והסביבה",
    south: "דרום ואילת",
    europe: "אירופה",
    usa: "ארה״ב",
    asia: "אסיה",
    other: "אחר",
  } satisfies Record<Area, string>,

  /** who the poster is looking for, in the section's own grammatical gender */
  wanted: {
    male: { one: "שותף אחד", few: "כמה שותפים", families: "משפחות בלבד" },
    female: { one: "שותפה אחת", few: "כמה שותפות", families: "משפחות בלבד" },
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

  travelsAs: {
    solo: "לבד",
    family: "עם המשפחה",
  } satisfies Record<TravelsAs, string>,

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
    days: (n: number) => (n === 1 ? "יום אחד" : `${n} ימים`),
    openUntil: (date: string) => `פתוח להצטרפות עד ${date}`,
    closesIn: (n: number) => (n <= 0 ? "נסגר היום" : n === 1 ? "נסגר מחר" : `עוד ${n} ימים`),
    daysBefore: (n: number) => `עד ${n} ימים לפני היציאה`,
    about: "על הטיול",
    lookingFor: "את מי מחפשים",
    style: "סגנון",
    joining: "הצטרפות",
    postedBy: "פורסם על ידי",
    askToJoin: "בקשה להצטרף",
    contactRule: "השיחה נפתחת רק אחרי שהבקשה מאושרת. פרטי קשר לא מוצגים.",
    requestPending: "הבקשה נשלחה וממתינה לאישור",
    requestAccepted: "הבקשה אושרה — אפשר לדבר",
    requestDeclined: "הבקשה לא אושרה",
    openChat: "לשיחה",
    yours: "זה טיול שפרסמת",
    manage: "לבקשות שהגיעו",
    closed: "ההצטרפות לטיול הזה נסגרה",
    notFound: "הטיול לא נמצא",
    back: "חזרה",
    requests: (n: number) => (n === 1 ? "בקשה אחת" : `${n} בקשות`),
  },

  join: {
    title: "בקשה להצטרף",
    noteLabel: "הודעה קצרה עם הבקשה",
    notePlaceholder: "למשל: שני אחים מירושלים, מטיילים בקצב רגוע",
    familiesHint: "הטיול מיועד למשפחות בלבד — כדאי לכתוב מי מהמשפחה מצטרף",
    send: "שליחת הבקשה",
    cancel: "ביטול",
    sent: "הבקשה נשלחה",
  },

  newTrip: {
    title: "פרסום טיול",
    kindQuestion: "איזה טיול?",
    plannedTitle: "טיול בתכנון",
    plannedDesc: "רעיון שיוצא לפועל אם יימצאו שותפים",
    plannedPrice: "חינם",
    bookedTitle: "טיול שהוזמן",
    bookedDesc: "כבר סגור — מי שרוצה יכול להצטרף",
    bookedPrice: (price: string) => `${price} חד־פעמי`,
    place: "לאן?",
    placePlaceholder: "למשל: הדולומיטים, צפון איטליה",
    area: "אזור",
    pickArea: "בחירת אזור",
    from: "מתאריך",
    to: "עד תאריך",
    wanted: "את מי מחפשים?",
    styles: "סגנון הטיול (אפשר לבחור כמה)",
    description: "תיאור",
    descriptionPlaceholder: "מה מתוכנן, קצב, רמת קושי, שבת, אוכל…",
    deadline: "עד מתי מחפשים שותפים?",
    deadlineDate: "עד תאריך",
    deadlineDays: "כמה ימים לפני היציאה",
    daysBeforeSuffix: "ימים לפני היציאה",
    postedIn: (where: string) => `הטיול יפורסם ${where}`,
    publish: "פרסום הטיול",
    toPayment: "המשך לתשלום",
    published: "הטיול פורסם",
    errors: {
      place: "צריך לכתוב לאן",
      area: "צריך לבחור אזור",
      dates: "צריך לבחור תאריכים",
      order: "תאריך הסיום לפני תאריך ההתחלה",
      past: "תאריך היציאה כבר עבר",
      deadline: "המועד האחרון צריך להיות מהיום ועד היציאה",
    },
  },

  payment: {
    title: "תשלום על פרסום",
    once: "תשלום חד־פעמי על הטיול הזה. פרסום טיול בתכנון — חינם.",
    demo: "זה אב־טיפוס — לא יתבצע חיוב אמיתי. המחיר לדוגמה בלבד.",
    pay: (price: string) => `תשלום ${price} (דמו)`,
    back: "חזרה לעריכה",
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
    closed: "סגור להצטרפות",
  },

  chat: {
    title: "שיחות",
    empty: "אין עדיין שיחות. שיחה נפתחת כשבקשת הצטרפות מאושרת.",
    about: (place: string) => `על הטיול: ${place}`,
    acceptedLine: "הבקשה אושרה — מכאן אפשר לדבר",
    placeholder: "כתיבת הודעה…",
    send: "שליחה",
    locked: "אין גישה לשיחה הזו",
  },

  profile: {
    title: "פרופיל",
    nickname: "כינוי",
    avatar: "דמות",
    gender: "מגדר",
    genderLocked: "נקבע בהרשמה ואי אפשר לשנות",
    travelsAs: "איך יוצאים לטיולים",
    city: "עיר",
    about: "קצת עליי",
    save: "שמירה",
    saved: "נשמר",
  },

  langSwitch: "English",
};

export type Dict = typeof he;
