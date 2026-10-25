import { addDays } from "./dates";
import type { JoinRequest, Message, Trip, User } from "./types";

/** the two people you can "be" in the prototype: one per section */
export const DEMO_MAN = "u-me-m";
export const DEMO_WOMAN = "u-me-f";

export interface SeedData {
  users: User[];
  trips: Trip[];
  requests: JoinRequest[];
  messages: Message[];
}

/** sample data with dates relative to today, so the prototype never goes stale */
export function makeSeed(today: string, now: Date): SeedData {
  const d = (n: number) => addDays(today, n);
  const ago = (hours: number) => new Date(now.getTime() - hours * 3_600_000).toISOString();

  const users: User[] = [
    { id: DEMO_MAN, nickname: "יוני", avatar: "compass", gender: "male", travelsAs: "solo", city: "ירושלים", about: "אוהב מסלולים ארוכים ושקט בבוקר" },
    { id: DEMO_WOMAN, nickname: "מיכל", avatar: "camel", gender: "female", travelsAs: "solo", city: "גבעת שמואל", about: "מטיילת בכל הזדמנות, בעיקר במדבר" },

    { id: "u-avi", nickname: "אבי", avatar: "mountain", gender: "male", travelsAs: "solo", city: "ירושלים", about: "מדריך טיולים לשעבר" },
    { id: "u-moshe", nickname: "משה ט.", avatar: "jeep", gender: "male", travelsAs: "family", city: "בית שמש", about: "אבא לחמישה, אוהבים שטח" },
    { id: "u-daniel", nickname: "דניאל", avatar: "backpack", gender: "male", travelsAs: "solo", city: "פתח תקווה", about: "אחרי צבא, מתכנן את הטיול הגדול" },
    { id: "u-shmuel", nickname: "שמואל", avatar: "tent", gender: "male", travelsAs: "solo", city: "צפת", about: "ישן בשטח כשאפשר" },
    { id: "u-yehuda", nickname: "יהודה", avatar: "camera", gender: "male", travelsAs: "solo", city: "מודיעין", about: "מצלם בתי כנסת עתיקים" },

    { id: "u-ruti", nickname: "רותי", avatar: "wave", gender: "female", travelsAs: "solo", city: "רעננה", about: "אוהבת אגמים ורכבות" },
    { id: "u-noa", nickname: "נועה ב.", avatar: "sun", gender: "female", travelsAs: "family", city: "אפרת", about: "אמא לארבעה" },
    { id: "u-ayala", nickname: "אילה", avatar: "bike", gender: "female", travelsAs: "solo", city: "חיפה", about: "רוכבת כל שבוע" },
    { id: "u-shira", nickname: "שירה", avatar: "plane", gender: "female", travelsAs: "solo", city: "ירושלים", about: "טסה פעמיים בשנה" },
    { id: "u-hana", nickname: "חנה", avatar: "tree", gender: "female", travelsAs: "solo", city: "בני ברק", about: "מעיינות ומסלולים קלים" },
  ];

  const trips: Trip[] = [
    // men's section
    {
      id: "t-dolomites", ownerId: "u-avi", kind: "booked", area: "europe", place: "הדולומיטים, צפון איטליה",
      startDate: d(24), endDate: d(31), wanted: "few", styles: ["hiking", "nature", "shabbat"],
      description: "טיסה ורכב כבר סגורים. מסלולי יום בהרים, שבת בקורטינה עם מניין מקומי. מחפשים עוד 2–3 שמגיעים בכושר סביר.",
      deadline: { type: "daysBefore", days: 10 }, createdAt: ago(30),
    },
    {
      id: "t-ramon", ownerId: "u-moshe", kind: "planned", area: "south", place: "מכתש רמון והערבה",
      startDate: d(12), endDate: d(14), wanted: "families", styles: ["nature", "adventure"],
      description: "רעיון לסוף שבוע ארוך עם הילדים, טיול ג'יפים במכתש. אם יהיו עוד 2 משפחות — סוגרים מדריך ולינה בחאן.",
      deadline: { type: "date", date: d(6) }, createdAt: ago(50),
    },
    {
      id: "t-vietnam", ownerId: "u-daniel", kind: "planned", area: "asia", place: "צפון וייטנאם",
      startDate: d(60), endDate: d(74), wanted: "one", styles: ["adventure", "cities", "food"],
      description: "שבועיים בצפון וייטנאם — סאפה ומפרץ הא לונג. אוכל כשר מבית חב״ד. מחפש שותף אחד בקצב דומה.",
      deadline: { type: "daysBefore", days: 21 }, createdAt: ago(8),
    },
    {
      id: "t-galil", ownerId: "u-shmuel", kind: "booked", area: "north", place: "שביל ישראל — קטע הגליל",
      startDate: d(5), endDate: d(8), wanted: "one", styles: ["hiking", "nature"],
      description: "סגרתי לינות בדרך. ארבעה ימים של הליכה, כ־15 ק״מ ביום. אם מישהו רוצה להצטרף — בשמחה.",
      deadline: { type: "daysBefore", days: 2 }, createdAt: ago(70),
    },
    {
      id: "t-prague", ownerId: "u-yehuda", kind: "planned", area: "europe", place: "פראג ווינה",
      startDate: d(40), endDate: d(46), wanted: "few", styles: ["cities", "food", "shabbat"],
      description: "סיור ערים, בתי כנסת עתיקים ומסעדות כשרות. שבת בפראג ליד בית הכנסת אלטנוי.",
      deadline: { type: "date", date: d(25) }, createdAt: ago(20),
    },
    {
      id: "t-amud", ownerId: DEMO_MAN, kind: "planned", area: "north", place: "נחל עמוד ומירון",
      startDate: d(18), endDate: d(19), wanted: "few", styles: ["hiking", "nature"],
      description: "יום וחצי של הליכה עם לינה בחניון לילה. מחפש 2–3 חבר'ה שאוהבים לקום מוקדם.",
      deadline: { type: "daysBefore", days: 5 }, createdAt: ago(40),
    },

    // women's section
    {
      id: "t-swiss", ownerId: "u-ruti", kind: "booked", area: "europe", place: "האגמים בשווייץ — לוצרן ואינטרלקן",
      startDate: d(30), endDate: d(36), wanted: "few", styles: ["nature", "relaxed", "shabbat"],
      description: "דירה כבר מוזמנת עם מקום לעוד 2. טיולים רגועים, רכבות הרים, שבת בלוצרן.",
      deadline: { type: "daysBefore", days: 14 }, createdAt: ago(26),
    },
    {
      id: "t-apollonia", ownerId: "u-noa", kind: "planned", area: "center", place: "אפולוניה וחוף נפרד בהרצליה",
      startDate: d(9), endDate: d(9), wanted: "families", styles: ["relaxed", "nature"],
      description: "רעיון ליום משפחות עם הילדים. אם יהיו עוד 2–3 משפחות נארגן הסעה משותפת.",
      deadline: { type: "date", date: d(5) }, createdAt: ago(12),
    },
    {
      id: "t-kinneret", ownerId: "u-ayala", kind: "planned", area: "north", place: "סובב כנרת באופניים",
      startDate: d(15), endDate: d(16), wanted: "one", styles: ["adventure", "nature"],
      description: "רכיבה של יומיים סביב הכנרת עם לינה בטבריה. מחפשת שותפה אחת שרוכבת באופן קבוע.",
      deadline: { type: "daysBefore", days: 4 }, createdAt: ago(60),
    },
    {
      id: "t-nyc", ownerId: "u-shira", kind: "booked", area: "usa", place: "ניו יורק",
      startDate: d(50), endDate: d(57), wanted: "one", styles: ["cities", "food", "shabbat"],
      description: "טיסות ומלון סגורים, חדר עם מקום לעוד אחת. מוזיאונים, ברוקלין ושבת בקראון הייטס.",
      deadline: { type: "daysBefore", days: 30 }, createdAt: ago(18),
    },
    {
      id: "t-springs", ownerId: "u-hana", kind: "planned", area: "jerusalem", place: "מעיינות בהרי ירושלים",
      startDate: d(7), endDate: d(7), wanted: "few", styles: ["hiking", "nature"],
      description: "יום הליכה קליל בין מעיינות — עין לבן ועין חנדק. מחפשות עוד כמה.",
      deadline: { type: "daysBefore", days: 2 }, createdAt: ago(5),
    },
    {
      id: "t-eilat", ownerId: DEMO_WOMAN, kind: "booked", area: "south", place: "מצפה רמון ואילת",
      startDate: d(20), endDate: d(23), wanted: "few", styles: ["relaxed", "nature", "shabbat"],
      description: "הזמנתי צימר לשבת במצפה רמון ואז יומיים באילת. יש מקום לעוד 2.",
      deadline: { type: "daysBefore", days: 7 }, createdAt: ago(45),
    },
  ];

  const requests: JoinRequest[] = [
    { id: "r-1", tripId: "t-amud", fromUserId: "u-daniel", note: "נשמע מעולה, הייתי בנחל עמוד לפני שנה ואשמח שוב", status: "pending", createdAt: ago(3) },
    { id: "r-2", tripId: "t-amud", fromUserId: "u-shmuel", note: "גר בצפת, אפשר להיפגש כבר במירון", status: "accepted", createdAt: ago(28) },
    { id: "r-3", tripId: "t-dolomites", fromUserId: DEMO_MAN, note: "יש לי ניסיון בהרים, אשמח להצטרף לכל המסלול", status: "pending", createdAt: ago(10) },

    { id: "r-4", tripId: "t-eilat", fromUserId: "u-ayala", note: "תמיד רציתי לראות את המכתש בלילה", status: "pending", createdAt: ago(2) },
    { id: "r-5", tripId: "t-eilat", fromUserId: "u-hana", note: "אשמח להצטרף, בלי הרבה הליכה", status: "accepted", createdAt: ago(30) },
    { id: "r-6", tripId: "t-nyc", fromUserId: DEMO_WOMAN, note: "גם אני מתכננת להיות שם באותו שבוע", status: "pending", createdAt: ago(6) },
  ];

  const messages: Message[] = [
    { id: "m-1", requestId: "r-2", fromUserId: DEMO_MAN, text: "היי שמואל, שמח שאתה מצטרף. יוצאים ב־7:00 מהחניון של נחל עמוד", at: ago(27) },
    { id: "m-2", requestId: "r-2", fromUserId: "u-shmuel", text: "מעולה, אביא גזייה וקפה ☕", at: ago(26) },
    { id: "m-3", requestId: "r-5", fromUserId: DEMO_WOMAN, text: "היי חנה, אישרתי! יש לך איך להגיע למצפה?", at: ago(29) },
    { id: "m-4", requestId: "r-5", fromUserId: "u-hana", text: "באוטובוס מבאר שבע, נגיע ביום שישי בצהריים", at: ago(28) },
  ];

  return { users, trips, requests, messages };
}
