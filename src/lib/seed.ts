import { addDays } from "./dates";
import { DEMO_MAN, DEMO_WOMAN } from "./seed-ids";
import { moreSeed } from "./seed-more";
import type { Block, JoinRequest, Message, Party, Report, Trip, User } from "./types";

const SOLO: Party = { type: "solo" };

export { DEMO_MAN, DEMO_WOMAN };

export interface SeedData {
  users: User[];
  trips: Trip[];
  requests: JoinRequest[];
  messages: Message[];
  reports: Report[];
  blocks: Block[];
}

type UserSeed = Omit<User, "status" | "notify" | "createdAt"> & Partial<Pick<User, "status" | "createdAt">>;

/** sample data with dates relative to today, so the prototype never goes stale */
export function makeSeed(today: string, now: Date): SeedData {
  const d = (n: number) => addDays(today, n);
  const ago = (hours: number) => new Date(now.getTime() - hours * 3_600_000).toISOString();

  const people: UserSeed[] = [
    { id: DEMO_MAN, fullName: "יונתן כהן", phone: "0501000001", nickname: "יוני", avatar: "compass", gender: "male", party: SOLO, ageGroup: "36-50", observance: "kosher", pace: "medium", city: "ירושלים", about: "אוהב מסלולים ארוכים ושקט בבוקר", history: { trips: 3, joined: 5 } },
    { id: DEMO_WOMAN, fullName: "מיכל לוי", phone: "0502000001", nickname: "מיכל", avatar: "camel", gender: "female", party: SOLO, ageGroup: "26-35", observance: "kosher", pace: "medium", city: "גבעת שמואל", about: "מטיילת בכל הזדמנות, בעיקר במדבר", history: { trips: 2, joined: 4 } },

    { id: "u-avi", fullName: "אבי מזרחי", phone: "0501000003", nickname: "אבי", avatar: "mountain", gender: "male", party: SOLO, ageGroup: "50+", observance: "kosher", pace: "hard", city: "ירושלים", about: "מדריך טיולים לשעבר", history: { trips: 14, joined: 31 } },
    { id: "u-moshe", fullName: "משה טננבאום", phone: "0501000004", nickname: "משה ט.", avatar: "jeep", gender: "male", party: { type: "family", parents: 2, kids: 5 }, ageGroup: "36-50", observance: "strict", pace: "easy", city: "בית שמש", about: "אבא לחמישה, אוהבים שטח", history: { trips: 4, joined: 9 } },
    { id: "u-daniel", fullName: "דניאל פרץ", phone: "0501000005", nickname: "דניאל", avatar: "backpack", gender: "male", party: SOLO, ageGroup: "18-25", observance: "kosher", pace: "hard", city: "פתח תקווה", about: "אחרי צבא, מתכנן את הטיול הגדול", history: { trips: 0, joined: 1 } },
    { id: "u-shmuel", fullName: "שמואל לוי", phone: "0501000006", nickname: "שמואל", avatar: "tent", gender: "male", party: SOLO, ageGroup: "26-35", observance: "strict", pace: "hard", city: "צפת", about: "ישן בשטח כשאפשר", history: { trips: 6, joined: 11 } },
    { id: "u-yehuda", fullName: "יהודה אדלר", phone: "0501000007", nickname: "יהודה", avatar: "camera", gender: "male", party: SOLO, ageGroup: "36-50", observance: "traditional", pace: "easy", city: "מודיעין", about: "מצלם בתי כנסת עתיקים", history: { trips: 2, joined: 3 } },

    { id: "u-ruti", fullName: "רות שפירא", phone: "0502000003", nickname: "רותי", avatar: "wave", gender: "female", party: SOLO, ageGroup: "50+", observance: "kosher", pace: "easy", city: "רעננה", about: "אוהבת אגמים ורכבות", history: { trips: 9, joined: 17 } },
    { id: "u-noa", fullName: "נועה ברקוביץ", phone: "0502000004", nickname: "נועה ב.", avatar: "sun", gender: "female", party: { type: "family", parents: 2, kids: 4 }, ageGroup: "36-50", observance: "strict", pace: "easy", city: "אפרת", about: "אמא לארבעה", history: { trips: 3, joined: 8 } },
    { id: "u-ayala", fullName: "אילה גולן", phone: "0502000005", nickname: "אילה", avatar: "bike", gender: "female", party: SOLO, ageGroup: "26-35", observance: "kosher", pace: "hard", city: "חיפה", about: "רוכבת כל שבוע", history: { trips: 5, joined: 7 } },
    { id: "u-shira", fullName: "שירה אזולאי", phone: "0502000006", nickname: "שירה", avatar: "plane", gender: "female", party: SOLO, ageGroup: "26-35", observance: "traditional", pace: "medium", city: "ירושלים", about: "טסה פעמיים בשנה", history: { trips: 7, joined: 12 } },
    { id: "u-hana", fullName: "חנה רוזן", phone: "0502000007", nickname: "חנה", avatar: "tree", gender: "female", party: SOLO, ageGroup: "50+", observance: "strict", pace: "easy", city: "בני ברק", about: "מעיינות ומסלולים קלים", history: { trips: 1, joined: 2 } },

    // waiting for the section's admin (the admin screen in the prototype)
    { id: "u-new-m", fullName: "אריאל בן דוד", phone: "0503000001", nickname: "אריאל", avatar: "bike", gender: "male", party: SOLO, ageGroup: "18-25", observance: "kosher", pace: "hard", city: "אשדוד", about: "רוכב שטח, מחפש חבר'ה לטיולים", history: { trips: 0, joined: 0 }, status: "pending", referredBy: "u-shmuel", referral: { name: "שמואל לוי", phone: "050-1000006" }, createdAt: ago(4) },
    { id: "u-new-f", fullName: "תמר אוחיון", phone: "0503000002", nickname: "תמר", avatar: "sun", gender: "female", party: { type: "family", parents: 2, kids: 3 }, ageGroup: "36-50", observance: "strict", pace: "easy", city: "אלעד", about: "אמא לשלושה, אוהבים טבע", history: { trips: 0, joined: 0 }, status: "pending", referredBy: "u-noa", referral: { name: "נועה ברק", phone: "050-2000004" }, createdAt: ago(9) },
  ];

  const users: User[] = people.map((p) => ({
    status: "active",
    notify: { push: true, email: false },
    createdAt: ago(24 * 90),
    ...p,
  }));

  const trip = (t: Omit<Trip, "status"> & { status?: Trip["status"] }): Trip => ({ status: "open", ...t });

  const trips: Trip[] = [
    // men's section
    trip({
      id: "t-dolomites", photo: "europe-seceda", ownerId: "u-avi", kind: "closed", area: "europe", place: "הדולומיטים, צפון איטליה",
      startDate: d(24), endDate: d(31), wanted: "few", styles: ["hiking", "nature", "shabbat"],
      description: "טיסה ורכב כבר סגורים. מסלולי יום בהרים, שבת בקורטינה עם מניין מקומי. מחפשים עוד 2–3 שמגיעים בכושר סביר.",
      deadline: { type: "daysBefore", days: 10 }, createdAt: ago(30),
    }),
    trip({
      id: "t-ramon", photo: "south-ramon", flex: { type: "range", days: 14 }, ownerId: "u-moshe", kind: "planned", area: "south", place: "מכתש רמון והערבה",
      startDate: d(12), endDate: d(14), wanted: "families", styles: ["nature", "adventure"],
      description: "רעיון לסוף שבוע ארוך עם הילדים, טיול ג'יפים במכתש. אם יהיו עוד 2 משפחות — סוגרים מדריך ולינה בחאן.",
      deadline: { type: "date", date: d(6) }, createdAt: ago(50),
    }),
    trip({
      id: "t-vietnam", photo: "asia-halong", flex: { type: "range", days: 7 }, ownerId: "u-daniel", kind: "planned", area: "asia", place: "צפון וייטנאם",
      startDate: d(60), endDate: d(74), wanted: "one", styles: ["adventure", "cities", "food"],
      description: "שבועיים בצפון וייטנאם — סאפה ומפרץ הא לונג. אוכל כשר מבית חב״ד. מחפש שותף אחד בקצב דומה.",
      deadline: { type: "daysBefore", days: 21 }, createdAt: ago(8),
    }),
    trip({
      id: "t-galil", photo: "north-golan-vineyard", ownerId: "u-shmuel", kind: "closed", area: "north", place: "שביל ישראל — קטע הגליל",
      startDate: d(5), endDate: d(8), wanted: "one", styles: ["hiking", "nature"],
      description: "סגרתי לינות בדרך. ארבעה ימים של הליכה, כ־15 ק״מ ביום. אם מישהו רוצה להצטרף — בשמחה.",
      deadline: { type: "daysBefore", days: 2 }, createdAt: ago(70),
    }),
    trip({
      id: "t-prague", photo: "europe-prague", flex: { type: "alt", startDate: d(54) }, ownerId: "u-yehuda", kind: "planned", area: "europe", place: "פראג ווינה",
      startDate: d(40), endDate: d(46), wanted: "few", styles: ["cities", "food", "shabbat"],
      description: "סיור ערים, בתי כנסת עתיקים ומסעדות כשרות. שבת בפראג ליד בית הכנסת אלטנוי.",
      deadline: { type: "date", date: d(25) }, createdAt: ago(20),
    }),
    trip({
      id: "t-nyc-m", photo: "usa-manhattan", ownerId: "u-avi", kind: "closed", area: "usa", place: "ניו יורק — ברוקלין ומנהטן",
      startDate: d(70), endDate: d(77), wanted: "few", styles: ["cities", "food", "shabbat"],
      description: "דירה בקראון הייטס סגורה לשבוע. מוזיאונים, סנטרל פארק ושבת עם הקהילה.",
      deadline: { type: "daysBefore", days: 30 }, createdAt: ago(15),
    }),
    // the demo man's own trips: one planned (requests he can't accept yet), one closed (with a chat)
    trip({
      id: "t-amud", photo: "north-kinneret", flex: { type: "fixed" }, ownerId: DEMO_MAN, kind: "planned", area: "north", place: "נחל עמוד ומירון",
      startDate: d(18), endDate: d(19), wanted: "few", styles: ["hiking", "nature"],
      description: "יום וחצי של הליכה עם לינה בחניון לילה. מחפש 2–3 חבר'ה שאוהבים לקום מוקדם.",
      deadline: { type: "daysBefore", days: 5 }, createdAt: ago(40),
    }),
    trip({
      id: "t-golan", photo: "north-golan-flowers", ownerId: DEMO_MAN, kind: "closed", area: "north", place: "סופ\"ש ג'יפים ברמת הגולן",
      startDate: d(33), endDate: d(35), wanted: "few", styles: ["adventure", "nature", "shabbat"],
      description: "צימר בקצרין סגור לשבת, יום ג'יפים ביום שישי ומסלול מים ביום ראשון.",
      deadline: { type: "daysBefore", days: 7 }, createdAt: ago(60),
    }),

    // women's section
    trip({
      id: "t-swiss", photo: "europe-swiss-lake", ownerId: "u-ruti", kind: "closed", area: "europe", place: "האגמים בשווייץ — לוצרן ואינטרלקן",
      startDate: d(30), endDate: d(36), wanted: "few", styles: ["nature", "relaxed", "shabbat"],
      description: "דירה כבר מוזמנת עם מקום לעוד 2. טיולים רגועים, רכבות הרים, שבת בלוצרן.",
      deadline: { type: "daysBefore", days: 14 }, createdAt: ago(26),
    }),
    trip({
      id: "t-apollonia", photo: "center-caesarea", flex: { type: "alt", startDate: d(16) }, ownerId: "u-noa", kind: "planned", area: "center", place: "אפולוניה וחוף נפרד בהרצליה",
      startDate: d(9), endDate: d(9), wanted: "families", styles: ["relaxed", "nature"],
      description: "רעיון ליום משפחות עם הילדים. אם יהיו עוד 2–3 משפחות נארגן הסעה משותפת.",
      deadline: { type: "date", date: d(5) }, createdAt: ago(12),
    }),
    trip({
      id: "t-kinneret", photo: "north-kinneret", flex: { type: "range", days: 3 }, ownerId: "u-ayala", kind: "planned", area: "north", place: "סובב כנרת באופניים",
      startDate: d(15), endDate: d(16), wanted: "one", styles: ["adventure", "nature"],
      description: "רכיבה של יומיים סביב הכנרת עם לינה בטבריה. מחפשת שותפה אחת שרוכבת באופן קבוע.",
      deadline: { type: "daysBefore", days: 4 }, createdAt: ago(60),
    }),
    trip({
      id: "t-nyc", photo: "usa-empire-state", ownerId: "u-shira", kind: "closed", area: "usa", place: "ניו יורק",
      startDate: d(50), endDate: d(57), wanted: "one", styles: ["cities", "food", "shabbat"],
      description: "טיסות ומלון סגורים, חדר עם מקום לעוד אחת. מוזיאונים, ברוקלין ושבת בקראון הייטס.",
      deadline: { type: "daysBefore", days: 30 }, createdAt: ago(18),
    }),
    trip({
      id: "t-springs", photo: "jerusalem-citadel-view", ownerId: "u-hana", kind: "planned", area: "jerusalem", place: "מעיינות בהרי ירושלים",
      startDate: d(7), endDate: d(7), wanted: "few", styles: ["hiking", "nature"],
      description: "יום הליכה קליל בין מעיינות — עין לבן ועין חנדק. מחפשות עוד כמה.",
      deadline: { type: "daysBefore", days: 2 }, createdAt: ago(5),
    }),
    trip({
      id: "t-eilat", photo: "south-eilat", ownerId: DEMO_WOMAN, kind: "closed", area: "south", place: "מצפה רמון ואילת",
      startDate: d(20), endDate: d(23), wanted: "few", styles: ["relaxed", "nature", "shabbat"],
      description: "הזמנתי צימר לשבת במצפה רמון ואז יומיים באילת. יש מקום לעוד 2.",
      deadline: { type: "daysBefore", days: 7 }, createdAt: ago(45),
    }),
  ];

  const req = (r: Omit<JoinRequest, "party"> & { party?: JoinRequest["party"] }): JoinRequest => ({ party: SOLO, ...r });

  const requests: JoinRequest[] = [
    req({ id: "r-1", tripId: "t-amud", fromUserId: "u-daniel", party: { type: "group", others: 1, note: "חבר מהגרעין מצטרף איתי" }, note: "נשמע מעולה, הייתי בנחל עמוד לפני שנה ואשמח שוב", status: "pending", createdAt: ago(3) }),
    req({ id: "r-7", tripId: "t-amud", fromUserId: "u-yehuda", note: "אשמח להצטרף, אני מביא מצלמה ותרמוס", status: "pending", createdAt: ago(7) }),
    req({ id: "r-2", tripId: "t-golan", fromUserId: "u-shmuel", note: "גר בצפת, אפשר להיפגש כבר בקצרין", status: "accepted", createdAt: ago(28) }),
    req({ id: "r-3", tripId: "t-dolomites", fromUserId: DEMO_MAN, note: "יש לי ניסיון בהרים, אשמח להצטרף לכל המסלול", status: "pending", createdAt: ago(10) }),

    req({ id: "r-4", tripId: "t-eilat", fromUserId: "u-ayala", note: "תמיד רציתי לראות את המכתש בלילה", status: "pending", createdAt: ago(2) }),
    req({ id: "r-5", tripId: "t-eilat", fromUserId: "u-hana", party: { type: "group", others: 1, note: "אחותי מצטרפת" }, note: "אשמח להצטרף, בלי הרבה הליכה", status: "accepted", createdAt: ago(30) }),
    req({ id: "r-6", tripId: "t-nyc", fromUserId: DEMO_WOMAN, note: "גם אני מתכננת להיות שם באותו שבוע", status: "pending", createdAt: ago(6) }),
  ];

  const messages: Message[] = [
    { id: "m-1", requestId: "r-2", fromUserId: DEMO_MAN, text: "היי שמואל, שמח שאתה מצטרף. נפגשים ביום שישי ב־8:00 בצימר", at: ago(27) },
    { id: "m-2", requestId: "r-2", fromUserId: "u-shmuel", text: "מעולה, אביא גזייה וקפה ☕", at: ago(26) },
    { id: "m-3", requestId: "r-5", fromUserId: DEMO_WOMAN, text: "היי חנה, אישרתי! יש לך איך להגיע למצפה?", at: ago(29) },
    { id: "m-4", requestId: "r-5", fromUserId: "u-hana", text: "באוטובוס מבאר שבע, נגיע ביום שישי בצהריים", at: ago(28) },
  ];

  const reports: Report[] = [
    { id: "rep-1", fromUserId: "u-ruti", aboutUserId: "u-shira", reason: "spam", text: "שלחה את אותה הודעה לכמה טיולים", status: "open", createdAt: ago(20) },
  ];

  // and five times as much of the same, so the prototype feels lived in (seed-more.ts)
  const more = moreSeed(d, ago);
  return {
    users: [...users, ...more.users],
    trips: [...trips, ...more.trips],
    requests: [...requests, ...more.requests],
    messages: [...messages, ...more.messages],
    reports: [...reports, ...more.reports],
    blocks: [],
  };
}
