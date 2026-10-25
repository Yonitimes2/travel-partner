import { DEMO_MAN, DEMO_WOMAN } from "./seed-ids";
import type {
  AgeGroup,
  AvatarId,
  DateFlex,
  Deadline,
  Gender,
  JoinRequest,
  Message,
  Observance,
  Pace,
  Party,
  PhotoId,
  Report,
  Trip,
  TripKind,
  TripStyle,
  User,
  Wanted,
  Area,
} from "./types";

/**
 * More sample content, so the prototype feels lived in: about five times the original people, trips,
 * requests and chats. Written as compact rows and turned into the app's records below.
 */

const SOLO: Party = { type: "solo" };
const group = (others: number, note = ""): Party => ({ type: "group", others, note });
const fam = (parents: 1 | 2, kids: number): Party => ({ type: "family", parents, kids });

// id, nickname, full name, avatar, city, age, observance, pace, party, about, past trips, past partners
type PersonRow = [string, string, string, AvatarId, string, AgeGroup, Observance, Pace, Party, string, number, number];

const MEN: PersonRow[] = [
  ["u-m01", "אלחנן", "אלחנן ברגמן", "mountain", "קריית ארבע", "26-35", "strict", "hard", SOLO, "מדריך שטח במילואים", 8, 15],
  ["u-m02", "נריה", "נריה שטרן", "backpack", "עלי", "18-25", "kosher", "hard", SOLO, "אחרי שנת שירות, מחפש הרפתקאות", 1, 2],
  ["u-m03", "אהרן ג.", "אהרן גולדברג", "jeep", "רמת בית שמש", "36-50", "strict", "medium", fam(2, 6), "משפחה גדולה שאוהבת שטח", 5, 18],
  ["u-m04", "עמית", "עמית רבינוביץ", "bike", "מודיעין", "26-35", "kosher", "hard", SOLO, "רוכב אופני הרים", 4, 6],
  ["u-m05", "בנימין", "בנימין אוחנה", "tent", "קצרין", "36-50", "kosher", "medium", group(2, "שני חברים מהשכונה"), "גר בגולן ומכיר כל שביל", 11, 20],
  ["u-m06", "יוסף ח.", "יוסף חדד", "sun", "נתיבות", "50+", "traditional", "easy", SOLO, "פנסיונר שאוהב לטייל בארץ", 6, 9],
  ["u-m07", "אורי", "אורי שלום", "camera", "ירושלים", "26-35", "kosher", "medium", SOLO, "צלם טבע חובב", 3, 5],
  ["u-m08", "מאיר", "מאיר וייס", "plane", "בני ברק", "36-50", "strict", "easy", SOLO, "טס לעסקים ומוסיף כמה ימי טיול", 7, 10],
  ["u-m09", "שלמה", "שלמה ביטון", "compass", "אשקלון", "50+", "traditional", "easy", fam(2, 0), "זוג שאוהב לטייל לאט", 4, 7],
  ["u-m10", "איתמר", "איתמר כץ", "wave", "חיפה", "18-25", "kosher", "hard", SOLO, "גולש וצולל", 2, 3],
  ["u-m11", "חיים", "חיים פרידמן", "tree", "צפת", "36-50", "strict", "medium", fam(1, 3), "אבא לשלושה, יוצאים בכל חופש", 3, 8],
  ["u-m12", "רועי", "רועי אלמוג", "mountain", "רעננה", "26-35", "traditional", "hard", SOLO, "טיפס על הקילימנג'רו ומחפש את הבא", 9, 12],
  ["u-m13", "דוד מ.", "דוד מלכה", "camel", "באר שבע", "36-50", "kosher", "medium", SOLO, "מכיר את הנגב כמו את כף היד", 10, 22],
  ["u-m14", "אליעזר", "אליעזר רוזנברג", "backpack", "ביתר עילית", "26-35", "strict", "medium", group(1, "אחי הקטן"), "אוהב מסלולים עם היסטוריה", 2, 4],
  ["u-m15", "יעקב", "יעקב אזולאי", "jeep", "אופקים", "50+", "traditional", "easy", fam(2, 3), "יש ג'יפ ואין סבלנות לשבת בבית", 6, 14],
  ["u-m16", "תומר", "תומר בן חיים", "bike", "פתח תקווה", "18-25", "kosher", "hard", SOLO, "מתכנן טיול גדול אחרי השחרור", 0, 1],
  ["u-m17", "נתנאל", "נתנאל דהן", "tent", "אריאל", "26-35", "kosher", "hard", SOLO, "ישן בשטח כל חודש", 5, 7],
  ["u-m18", "שמעון", "שמעון פרלמן", "plane", "ירושלים", "50+", "strict", "easy", SOLO, "מטייל באירופה בעקבות קהילות", 12, 19],
  ["u-m19", "גלעד", "גלעד ששון", "wave", "נתניה", "36-50", "traditional", "medium", fam(2, 2), "משפחה שאוהבת ים", 4, 10],
  ["u-m20", "ישי", "ישי אברהם", "compass", "שילה", "18-25", "kosher", "hard", group(3, "חבר'ה מהישיבה"), "יוצאים בכל בין הזמנים", 2, 6],
  ["u-m21", "אברהם", "אברהם קליין", "sun", "אלעד", "36-50", "strict", "easy", fam(2, 5), "טיולים רגועים עם הרבה ילדים", 3, 11],
  ["u-m22", "עידו", "עידו נחום", "camera", "תל אביב", "26-35", "traditional", "medium", SOLO, "אוהב ערים ואוכל", 6, 8],
  ["u-m23", "משה ר.", "משה רחמים", "tree", "טבריה", "50+", "kosher", "easy", SOLO, "גר ליד הכנרת ומכיר את כל המעיינות", 7, 13],
  ["u-m24", "אביתר", "אביתר זילבר", "mountain", "גוש עציון", "26-35", "kosher", "hard", SOLO, "סקי בחורף, הליכה בקיץ", 5, 9],
];

const WOMEN: PersonRow[] = [
  ["u-f01", "טליה", "טליה ברגר", "wave", "תל אביב", "26-35", "kosher", "medium", SOLO, "אוהבת ים וערים קטנות", 4, 6],
  ["u-f02", "אסתר", "אסתר גרינברג", "tree", "בני ברק", "50+", "strict", "easy", group(2, "שתי חברות"), "יוצאת לטייל עם חברות כל חודש", 9, 16],
  ["u-f03", "הדס", "הדס עמר", "camera", "רחובות", "26-35", "kosher", "medium", SOLO, "מצלמת פרחים ונופים", 3, 5],
  ["u-f04", "רבקה", "רבקה לוינסון", "sun", "קריית ספר", "36-50", "strict", "easy", fam(1, 4), "אמא לארבעה, אוהבים פארקים", 2, 9],
  ["u-f05", "יעל", "יעל שמעוני", "mountain", "ירושלים", "26-35", "kosher", "hard", SOLO, "טרקים ארוכים, כמה שיותר גבוה", 7, 11],
  ["u-f06", "שרה", "שרה כהן", "compass", "פתח תקווה", "50+", "traditional", "easy", group(2, "שתי חברות"), "מטיילת עם חברות מאז שהילדים גדלו", 8, 14],
  ["u-f07", "נעמה", "נעמה פרץ", "bike", "מעלה אדומים", "18-25", "kosher", "hard", SOLO, "רוכבת ומטפסת", 1, 2],
  ["u-f08", "אביגיל", "אביגיל טל", "plane", "רעננה", "26-35", "traditional", "medium", SOLO, "עובדת מהבית ומטיילת בעולם", 6, 8],
  ["u-f09", "מרים", "מרים אדלר", "backpack", "חיפה", "36-50", "kosher", "medium", fam(2, 3), "משפחה שגרה בתרמילים", 5, 15],
  ["u-f10", "הילה", "הילה סויסה", "camel", "דימונה", "26-35", "traditional", "medium", SOLO, "מכירה את המדבר ואוהבת לשתף", 4, 7],
  ["u-f11", "לאה", "לאה רוזן", "tree", "ירושלים", "50+", "strict", "easy", SOLO, "אוהבת גנים בוטניים ומוזיאונים", 3, 4],
  ["u-f12", "אורית", "אורית מזרחי", "sun", "אשדוד", "36-50", "traditional", "easy", fam(2, 2), "יוצאים בכל חופש", 4, 10],
  ["u-f13", "תהילה", "תהילה גבאי", "wave", "חדרה", "18-25", "kosher", "medium", SOLO, "אחרי שירות לאומי, רוצה לראות את העולם", 0, 1],
  ["u-f14", "רחלי", "רחלי ויס", "mountain", "בית שמש", "26-35", "strict", "hard", group(1, "אחותי"), "אוהבת פסגות ושקט", 5, 8],
  ["u-f15", "דבורה", "דבורה שלו", "compass", "קדומים", "36-50", "kosher", "medium", fam(2, 5), "משפחה גדולה עם ניסיון בקמפינג", 6, 21],
  ["u-f16", "אפרת", "אפרת נגר", "bike", "כפר סבא", "26-35", "kosher", "hard", SOLO, "רוכבת שבילים בסופי שבוע", 3, 5],
  ["u-f17", "חוה", "חוה שטרן", "plane", "נתניה", "50+", "traditional", "easy", SOLO, "טסה לבקר נכדים ומוסיפה טיול", 5, 6],
  ["u-f18", "יהודית", "יהודית אלון", "camera", "גבעת שמואל", "36-50", "kosher", "medium", SOLO, "מדריכת טיולים בהכשרה", 8, 13],
  ["u-f19", "צביה", "צביה הלוי", "tent", "יצהר", "26-35", "kosher", "hard", SOLO, "ישנה בשטח ואוהבת כוכבים", 4, 6],
  ["u-f20", "שולמית", "שולמית כץ", "tree", "טבריה", "50+", "kosher", "easy", group(3, "חברות מהקהילה"), "מארגנת טיולי נשים כבר עשר שנים", 15, 32],
  ["u-f21", "מורן", "מורן אברהם", "sun", "באר שבע", "26-35", "traditional", "medium", fam(2, 1), "זוג צעיר עם תינוקת", 1, 3],
  ["u-f22", "נחמה", "נחמה פישר", "backpack", "ירושלים", "18-25", "strict", "medium", SOLO, "סטודנטית שמחפשת טיולים זולים", 0, 2],
  ["u-f23", "אילנה", "אילנה דוד", "jeep", "קריית שמונה", "36-50", "traditional", "hard", SOLO, "נוהגת ג'יפ ומכירה את הגליל העליון", 9, 17],
  ["u-f24", "בתיה", "בתיה שפירא", "camel", "אילת", "36-50", "kosher", "medium", fam(2, 3), "גרים באילת ומארחים בשמחה", 5, 12],
];

// id, owner, kind, area, place, photo, starts in (days), length (days), wanted, styles, description,
// deadline (days before departure, or { at: days from today }), date option
type TripRow = [
  string, string, TripKind, Area, string, PhotoId, number, number, Wanted, TripStyle[], string,
  number | { at: number }, (["range", number] | ["alt", number])?,
];

const TRIPS: TripRow[] = [
  // men's section
  ["t-m01", "u-m05", "closed", "north", "בניאס והחרמון", "north-golan-flowers", 9, 2, "few", ["hiking", "nature"], "סוף שבוע בגולן: בניאס בבוקר, נחל סער אחר הצהריים ולינה בצימר במסעדה. יש מקום ברכב לעוד שניים.", 3],
  ["t-m02", "u-m12", "closed", "europe", "טרק מון בלאן — שאמוני", "europe-seceda", 45, 9, "few", ["hiking", "adventure", "shabbat"], "שמונה ימים סביב מון בלאן עם לינה בבקתות ושבת בקורמאייר. צריך כושר טוב.", 21],
  ["t-m03", "u-m13", "planned", "south", "נחל צין ועין עבדת", "south-negev", 14, 1, "few", ["hiking", "nature"], "יום הליכה בנחל צין עד הבריכות של עין עבדת. יציאה מבאר שבע ב־6:00.", { at: 10 }, ["range", 3]],
  ["t-m04", "u-m03", "planned", "north", "קמפינג בחוף הכנרת", "north-kinneret", 20, 3, "families", ["relaxed", "nature", "shabbat"], "שבת קמפינג משפחתית בחוף צאלון. מביאים אוהלים, בשר ומשחקים לילדים.", 7, ["alt", 27]],
  ["t-m05", "u-m04", "closed", "north", "סינגלים ביער ביריה", "north-golan-vineyard", 6, 1, "one", ["adventure", "nature"], "רכיבת סינגלים של 40 ק״מ ביער ביריה ובעין זיתים. רמה בינונית עד קשה.", 1],
  ["t-m06", "u-m18", "closed", "europe", "בעקבות קהילות — אמסטרדם ואנטוורפן", "europe-prague", 60, 6, "few", ["cities", "food", "shabbat"], "סיור בבתי כנסת היסטוריים, שבת עם הקהילה באנטוורפן ואוכל כשר בכל יום.", 25],
  ["t-m07", "u-m06", "planned", "south", "מכתש רמון בזריחה", "south-ramon", 25, 2, "few", ["relaxed", "nature"], "יוצאים בחמישי בערב, לינה במצפה רמון וזריחה על שפת המכתש. קצב רגוע.", 7, ["range", 7]],
  ["t-m08", "u-m20", "planned", "north", "שביל הגולן — הקטע הצפוני", "north-golan-flowers", 33, 4, "few", ["hiking", "adventure"], "ארבעה ימים על שביל הגולן מהחרמון דרומה, עם לינה בשטח. בבין הזמנים.", 10, ["alt", 40]],
  ["t-m09", "u-m08", "closed", "usa", "ניו יורק ואגם ג'ורג'", "usa-manhattan", 70, 7, "one", ["cities", "food", "shabbat"], "אחרי כנס בניו יורק נשארים לשבת בבורו פארק ואז יומיים באגם ג'ורג'.", 30],
  ["t-m10", "u-m10", "planned", "south", "צלילה באילת", "south-eilat", 18, 3, "few", ["adventure", "relaxed"], "שלושה ימי צלילה בחוף האלמוגים. צריך רישיון צלילה בסיסי.", 5],
  ["t-m11", "u-m21", "planned", "center", "יום משפחות בקיסריה", "center-caesarea", 12, 1, "families", ["relaxed", "nature"], "יום משפחות בגן הלאומי קיסריה ובחוף האמה. פיקניק וסיור קצר שמתאים לקטנים.", { at: 9 }],
  ["t-m12", "u-m07", "closed", "jerusalem", "צילום זריחה על חומות העיר העתיקה", "jerusalem-citadel-walls", 8, 1, "few", ["cities"], "סיור צילום עם שחר על טיילת החומות, ואחר כך ארוחת בוקר ברובע.", 2],
  ["t-m13", "u-m14", "planned", "jerusalem", "מנהרות הכותל ועיר דוד", "jerusalem-citadel-view", 16, 1, "few", ["cities"], "יום מלא: מנהרות הכותל בבוקר, עיר דוד ונקבת חזקיהו אחר הצהריים.", 4],
  ["t-m14", "u-m24", "closed", "europe", "סקי בדולומיטים", "europe-carezza", 95, 7, "few", ["adventure", "shabbat"], "שבוע סקי בוואל גרדנה, דירה עם מטבח כשר. מתאים למי שכבר גולש.", 45],
  ["t-m15", "u-m22", "planned", "europe", "רומא בארבעה ימים", "europe-prague", 52, 4, "one", ["cities", "food"], "רומא בקצב טוב: הגטו היהודי, הפורום והקולוסיאום, ואוכל כשר ברובע.", { at: 30 }, ["alt", 59]],
  ["t-m16", "u-m15", "closed", "south", "ג'יפים בהר הנגב", "south-negev", 11, 2, "families", ["adventure", "nature"], "יומיים של ג'יפים בהר הנגב עם לינה בחאן. יש מקום לעוד שתי משפחות עם רכב 4x4.", 4],
  ["t-m17", "u-m16", "planned", "asia", "תאילנד — צפון ואיים", "asia-halong-sunset", 110, 21, "one", ["adventure", "food"], "שלושה שבועות: צ'יאנג מאי, פאי ואז איים בדרום. בתי חב״ד בדרך.", 30, ["range", 14]],
  ["t-m18", "u-m17", "closed", "north", "נחל כזיב — לינה בשטח", "north-golan-vineyard", 13, 2, "few", ["hiking", "nature"], "יומיים בנחל כזיב עם לינה ליד מבצר מונפורט. הליכה של כ־12 ק״מ ביום.", 3],
  ["t-m19", "u-m23", "planned", "north", "מעיינות סביב הכנרת", "north-kinneret", 7, 1, "few", ["relaxed", "nature"], "יום רגוע: מעיינות סביב הכנרת, טבילה בחמת גדר וארוחה בטבריה.", 2],
  ["t-m20", "u-m01", "closed", "south", "מדבר יהודה — נחל דרגות", "south-negev", 22, 2, "few", ["adventure", "hiking"], "סנפלינג בדרגות ולינה במצוקי דרגות. את הציוד הקבוצתי אני מביא.", 7],
  ["t-m21", "u-m19", "planned", "center", "טיילת השרון באופניים", "center-jaffa", 15, 1, "families", ["relaxed", "nature"], "רכיבה משפחתית לאורך הטיילת מנתניה דרומה, עם עצירות לגלידה ולים.", 3],
  ["t-m22", "u-m11", "planned", "north", "שבת בצפת העתיקה", "north-golan-flowers", 28, 3, "families", ["cities", "shabbat", "food"], "שבת בצפת עם הילדים, גלריות ובתי כנסת עתיקים, ויום בנחל עמוד.", 10, ["range", 7]],
  ["t-m23", "u-m09", "closed", "usa", "שבוע בניו יורק בחורף", "usa-empire-state", 38, 7, "few", ["cities", "food", "shabbat"], "שבוע בניו יורק: מוזיאונים, ברוקלין ושבת בקראון הייטס. המלון כבר סגור.", 14],
  ["t-m24", "u-m02", "planned", "asia", "וייטנאם מצפון לדרום", "asia-halong", 120, 28, "one", ["adventure", "cities", "food"], "חודש בווייטנאם מהא לונג ועד הדלתא, בתקציב נמוך. מחפש שותף שזורם.", 30, ["alt", 130]],
  ["t-m25", "u-m05", "planned", "north", "פריחה ברמת הגולן", "north-golan-flowers", 40, 1, "few", ["nature", "relaxed"], "טיול פריחה בגולן: תל סאקי, עמק הבכא וגבעת האם. בלי הליכות ארוכות.", { at: 30 }],
  ["t-m26", "u-m13", "closed", "south", "שבת במכתש רמון", "south-ramon", 30, 2, "few", ["adventure", "nature", "shabbat"], "ג'יפים ביום שישי, שבת בחאן בארות ותפילה מול המכתש.", 7],
  ["t-m27", "u-m12", "planned", "other", "טרק באיסלנד", "other-wing-clouds", 150, 10, "few", ["hiking", "adventure"], "עשרה ימים על כביש הטבעת עם טרק ללנדמנלאוגר. עדיין בתכנון, הכול גמיש.", 40, ["range", 14]],
  ["t-m28", "u-m03", "closed", "jerusalem", "גן החיות התנ״כי ועין כרם", "jerusalem-citadel-view", 10, 1, "families", ["relaxed", "nature"], "בוקר בגן החיות התנ״כי ואחר הצהריים טיול קליל בעין כרם.", 2],

  // women's section
  ["t-f01", "u-f01", "closed", "center", "יפו העתיקה והנמל", "center-jaffa", 5, 1, "few", ["cities", "food"], "סיור בסמטאות יפו, בנמל ובשוק, ושקיעה על המצוק. ארוחת ערב כשרה בתל אביב.", 1],
  ["t-f02", "u-f05", "closed", "europe", "אלטה ויה 1 בדולומיטים", "europe-seceda", 55, 8, "few", ["hiking", "adventure", "shabbat"], "שמונה ימים על אלטה ויה 1 עם לינה בבקתות. לשבת מביאות אוכל כשר מהבית.", 25],
  ["t-f03", "u-f02", "planned", "jerusalem", "גנים וחצרות בירושלים", "jerusalem-citadel-walls", 9, 1, "few", ["relaxed", "cities"], "יום רגוע בגן הבוטני, בעמק המצלבה ובשכונות הישנות. מתאים לכל גיל.", 2],
  ["t-f04", "u-f04", "planned", "north", "יום מים בגן השלושה", "north-kinneret", 13, 1, "families", ["relaxed", "nature"], "יום מים בסחנה עם הילדים. מגיעים מוקדם כדי לתפוס צל.", { at: 8 }, ["alt", 20]],
  ["t-f05", "u-f09", "closed", "europe", "שבוע משפחות בשווייץ", "europe-swiss-lake", 75, 7, "families", ["nature", "relaxed", "shabbat"], "בית גדול באינטרלקן שמתאים לשתי משפחות. רכבות הרים, אגמים ושבת שקטה.", 30],
  ["t-f06", "u-f10", "planned", "south", "תמנע ושנורקלינג באילת", "south-eilat", 24, 2, "few", ["nature", "relaxed"], "יום בפארק תמנע, לינה באילת ושנורקלינג בבוקר. קצב נוח.", 7, ["range", 3]],
  ["t-f07", "u-f08", "closed", "usa", "ניו יורק בסתיו", "usa-manhattan", 35, 6, "one", ["cities", "food"], "מלון במנהטן כבר סגור, חדר עם מקום לעוד אחת. מוזיאונים, סנטרל פארק ואוכל כשר.", 14],
  ["t-f08", "u-f14", "planned", "north", "פסגת החרמון", "north-golan-flowers", 21, 1, "few", ["hiking", "nature"], "עלייה לחרמון ברכבל והליכה בשביל הפסגה. כדאי לבוא עם שכבות.", 5],
  ["t-f09", "u-f15", "closed", "north", "קמפינג משפחות בנחל עמוד", "north-golan-vineyard", 17, 3, "families", ["nature", "shabbat"], "שבת קמפינג בחניון נחל עמוד. יש לנו ציוד לבישול כשר לכולם.", 5],
  ["t-f10", "u-f16", "planned", "center", "רכיבה בפארק הירקון", "center-jaffa", 4, 1, "one", ["adventure"], "רכיבה של 30 ק״מ מראש העין לים, בקצב בינוני. מחפשת שותפה לבוקר שישי.", 1],
  ["t-f11", "u-f20", "closed", "north", "טיול נשים בגליל — מעיינות ויקב", "north-kinneret", 19, 2, "few", ["relaxed", "food", "nature"], "יומיים בגליל: מעיינות, יקב קטן בכשרות מהדרין ולינה בצימר. אנחנו כבר שש, יש מקום לעוד ארבע.", 7],
  ["t-f12", "u-f05", "planned", "asia", "סובב אנאפורנה בנפאל", "other-wing-sunset", 130, 18, "one", ["hiking", "adventure"], "סובב אנאפורנה בשבועיים וחצי, כולל מעבר תורונג לה. שבת בבית חב״ד בפוקרה.", 45, ["range", 14]],
  ["t-f13", "u-f11", "planned", "jerusalem", "מוזיאון ישראל והיכל הספר", "jerusalem-citadel-view", 11, 1, "one", ["cities", "relaxed"], "בוקר במוזיאון ישראל ובהיכל הספר, ואחר כך הליכה קלה בעמק המצלבה.", 3],
  ["t-f14", "u-f12", "closed", "south", "חופשת משפחות באילת", "south-eilat", 42, 4, "families", ["relaxed", "nature"], "ארבעה ימים באילת: מצפה תת־ימי, חוף אלמוג וטיול ג'יפים קצר. המלון כשר.", 14],
  ["t-f15", "u-f13", "planned", "europe", "פראג, וינה ובודפשט ברכבת", "europe-prague", 85, 8, "few", ["cities", "food"], "שמונה ימים ברכבות בין פראג, וינה ובודפשט, באכסניות ובתקציב נמוך.", 30, ["alt", 99]],
  ["t-f16", "u-f19", "closed", "south", "לילה במכתש הגדול", "south-ramon", 15, 2, "few", ["adventure", "nature"], "לינה בשטח במכתש הגדול, תצפית כוכבים והליכה בחולות הצבעוניים.", 4],
  ["t-f17", "u-f17", "planned", "usa", "ניו יורק ועמק ההדסון", "usa-empire-state", 65, 10, "one", ["relaxed", "cities"], "מבקרת נכדים בלייקווד ומחפשת שותפה לכמה ימי טיול בניו יורק ובעמק ההדסון.", 20],
  ["t-f18", "u-f21", "planned", "center", "קיסריה עם תינוקות", "center-caesarea", 10, 1, "families", ["relaxed"], "בוקר בגן הלאומי קיסריה בשביל נגיש לעגלות, ופיקניק ליד האמה.", { at: 7 }],
  ["t-f19", "u-f18", "closed", "jerusalem", "העיר העתיקה עם מדריכה", "jerusalem-citadel-walls", 6, 1, "few", ["cities"], "סיור מודרך ברובע היהודי, בקרדו ובמגדל דוד. אני מדריכה בהכשרה ומחפשת קבוצה קטנה.", 2],
  ["t-f20", "u-f23", "planned", "north", "ג'יפים בגליל העליון", "north-golan-vineyard", 26, 1, "few", ["adventure", "nature"], "יום ג'יפים בכביש הצפון ובנחל דישון. יש לי ג'יפ ומקום לעוד שלוש.", 5, ["range", 7]],
  ["t-f21", "u-f24", "closed", "south", "שבת באילת אצלנו", "south-eilat", 23, 3, "families", ["relaxed", "shabbat"], "גרים באילת ומזמינים משפחה לשבת. בחול: חוף הדולפינים ותצפית מהר יואש.", 5],
  ["t-f22", "u-f03", "planned", "north", "שקיעה מעל הכנרת", "north-kinneret", 12, 1, "one", ["nature"], "יציאה לצילום שקיעה מעל הכנרת, ואחר כך ארוחה בטבריה.", 2],
  ["t-f23", "u-f06", "closed", "europe", "שייט באגם לוצרן", "europe-swiss-lake", 48, 5, "few", ["relaxed", "nature", "shabbat"], "חמישה ימים סביב אגם לוצרן, שייט ורכבות. אנחנו שלוש, יש מקום לעוד אחת או שתיים.", 21],
  ["t-f24", "u-f07", "planned", "south", "שביל ישראל באופניים — הנגב", "south-negev", 34, 3, "one", ["adventure", "hiking"], "שלושה ימי רכיבה מערד למצפה רמון על שביל ישראל לאופניים.", 7, ["alt", 41]],
  ["t-f25", "u-f22", "planned", "asia", "וייטנאם בתקציב של סטודנטיות", "asia-halong", 140, 14, "few", ["adventure", "food"], "שבועיים בווייטנאם, אכסניות ואוטובוסי לילה. מחפשת עוד שתיים או שלוש.", 45, ["range", 14]],
  ["t-f26", "u-f15", "planned", "jerusalem", "גן הפעמון ושוק מחנה יהודה", "jerusalem-citadel-view", 18, 1, "families", ["relaxed", "food"], "בוקר בגן הפעמון עם הילדים, וצהריים בשוק מחנה יהודה.", 3],
  ["t-f27", "u-f09", "planned", "europe", "קרוואנים בדולומיטים", "europe-carezza", 100, 10, "families", ["nature", "shabbat"], "עשרה ימים בקמפינג קרוואנים בדולומיטים. כבר יש שתי משפחות.", 40, ["range", 7]],
  ["t-f28", "u-f01", "closed", "other", "קפריסין — לימסול ופאפוס", "other-wing-sunset", 29, 4, "few", ["relaxed", "food"], "ארבעה ימים בלימסול ובפאפוס, שבת אצל חב״ד ושייט ליד המפרצים.", 10],
];

// id, trip, from, status, note, party, hours ago
type RequestRow = [string, string, string, JoinRequest["status"], string, Party, number];

const REQUESTS: RequestRow[] = [
  // the demo man, and requests on his trips
  ["r-x01", "t-m01", DEMO_MAN, "accepted", "אשמח להצטרף, יש לי רכב אם צריך", SOLO, 40],
  ["r-x02", "t-m02", DEMO_MAN, "pending", "עשיתי את הטרק סביב המטרהורן, בכושר טוב", SOLO, 12],
  ["r-x03", "t-golan", "u-m17", "pending", "גר באריאל, מביא אוהל וציוד בישול", SOLO, 5],
  ["r-x04", "t-golan", "u-m24", "pending", "יש לי ניסיון בג'יפים", group(1, "חבר מהעבודה"), 9],
  ["r-x05", "t-m02", "u-m01", "accepted", "מכיר את האזור, הייתי בקורמאייר", SOLO, 60],
  ["r-x06", "t-m02", "u-m17", "pending", "", SOLO, 20],
  ["r-x07", "t-m09", "u-m22", "pending", "אני בניו יורק באותו שבוע", SOLO, 15],
  ["r-x08", "t-m16", "u-m03", "accepted", "יש לנו ג'יפ, משפחה של שמונה", fam(2, 6), 70],
  ["r-x09", "t-m16", "u-m19", "pending", "", fam(2, 2), 22],
  ["r-x10", "t-m05", "u-m16", "accepted", "רוכב שלוש שנים, קצב טוב", SOLO, 30],
  ["r-x11", "t-m12", "u-m14", "accepted", "", group(1, "אחי הקטן"), 50],
  ["r-x12", "t-m18", "u-m20", "pending", "", group(3, "חבר'ה מהישיבה"), 8],
  ["r-x13", "t-m20", "u-m10", "accepted", "עשיתי סנפלינג בעבר", SOLO, 44],
  ["r-x14", "t-m26", "u-m06", "pending", "אשמח לשבת במדבר", SOLO, 3],
  ["r-x15", "t-m14", "u-m12", "pending", "גולש כבר שלוש עונות", SOLO, 26],

  // the demo woman, and requests on her trips
  ["r-y01", "t-f11", DEMO_WOMAN, "accepted", "אשמח מאוד, אוהבת יקבים קטנים", SOLO, 36],
  ["r-y02", "t-f02", DEMO_WOMAN, "pending", "עשיתי טרקים בגאורגיה, בכושר טוב", SOLO, 14],
  ["r-y03", "t-eilat", "u-f10", "pending", "גרה בדימונה, אפשר לאסוף אותך בדרך", SOLO, 4],
  ["r-y04", "t-f02", "u-f14", "accepted", "", group(1, "אחותי"), 55],
  ["r-y05", "t-f05", "u-f15", "pending", "משפחה של שבעה, יש לנו רכב", fam(2, 5), 18],
  ["r-y06", "t-f07", "u-f17", "accepted", "אני בניו יורק בדיוק אז", SOLO, 48],
  ["r-y07", "t-f09", "u-f04", "pending", "", fam(1, 4), 11],
  ["r-y08", "t-f09", "u-f21", "accepted", "", fam(2, 1), 33],
  ["r-y09", "t-f16", "u-f07", "accepted", "אוהבת לישון בשטח", SOLO, 27],
  ["r-y10", "t-f19", "u-f11", "pending", "", SOLO, 6],
  ["r-y11", "t-f19", "u-f02", "accepted", "", group(2, "שתי חברות"), 29],
  ["r-y12", "t-f23", "u-f18", "pending", "", SOLO, 16],
  ["r-y13", "t-f14", "u-f24", "pending", "גרים באילת, נשמח להצטרף לחלק מהימים", fam(2, 3), 21],
];

// id, request, from, text, hours ago
type MessageRow = [string, string, string, string, number];

const MESSAGES: MessageRow[] = [
  ["m-x01", "r-x01", "u-m05", "ברוך הבא! נפגשים בצומת מחניים ב־7:00", 39],
  ["m-x02", "r-x01", DEMO_MAN, "מעולה, אני מביא קפה לדרך", 38],
  ["m-x03", "r-x01", "u-m05", "יש גם מקום לתיק גדול ברכב", 37],
  ["m-y01", "r-y01", "u-f20", "שמחה שאת מצטרפת! הצימר בגוש חלב", 35],
  ["m-y02", "r-y01", DEMO_WOMAN, "נשמע מושלם. מה להביא?", 34],
  ["m-y03", "r-y01", "u-f20", "בגד ים צנוע למעיין ונעליים טובות", 33],
  ["m-x04", "r-x08", "u-m15", "מעולה, נשמע שהילדים יסתדרו", 69],
  ["m-x05", "r-x08", "u-m03", "אנחנו מביאים מנגל וכיסאות", 68],
  ["m-y04", "r-y04", "u-f05", "את ואחותך, מושלם. יש לכן תרמילים?", 54],
  ["m-y05", "r-y04", "u-f14", "כן, כבר עשינו את שביל ישראל", 53],
  ["m-y06", "r-y06", "u-f08", "החדר כבר מחכה. ניפגש בשדה?", 47],
  ["m-y07", "r-y06", "u-f17", "אני נוחתת יום לפני, אחכה במלון", 46],
  ["m-x06", "r-x10", "u-m04", "יוצאים מהחניון של ביריה ב־8:00", 29],
  ["m-x07", "r-x10", "u-m16", "אהיה שם עם אופניים מוכנים", 28],
  ["m-x08", "r-x13", "u-m01", "תביא כפפות וגובה של 50 מטר חבל, השאר עליי", 43],
];

export function moreSeed(d: (days: number) => string, ago: (hours: number) => string) {
  const person = (gender: Gender, phonePrefix: string) =>
    ([id, nickname, fullName, avatar, city, ageGroup, observance, pace, party, about, trips, joined]: PersonRow, i: number): User => ({
      id,
      nickname,
      fullName,
      phone: `${phonePrefix}${String(i + 1).padStart(6, "0")}`,
      avatar,
      gender,
      party,
      ageGroup,
      observance,
      pace,
      city,
      about,
      status: "active",
      history: { trips, joined },
      notify: { push: true, email: false },
      createdAt: ago(24 * (30 + i * 3)),
    });

  const users: User[] = [...MEN.map(person("male", "0504")), ...WOMEN.map(person("female", "0505"))];

  // three more people waiting for the admins: two recommendations match the name on file, one doesn't quite
  const pending = (id: string, nickname: string, fullName: string, gender: Gender, avatar: AvatarId, city: string, by: string, typed: string, hours: number): User => {
    const recommender = users.find((u) => u.id === by)!;
    return {
      id, nickname, fullName, phone: `0506${String(hours).padStart(6, "0")}`, avatar, gender, party: SOLO,
      ageGroup: "26-35", observance: "kosher", pace: "medium", city, about: "", status: "pending",
      referredBy: by, referral: { name: typed, phone: `${recommender.phone.slice(0, 3)}-${recommender.phone.slice(3)}` },
      history: { trips: 0, joined: 0 }, notify: { push: true, email: false }, createdAt: ago(hours),
    };
  };
  users.push(
    pending("u-new-m2", "שגיא", "שגיא לוי", "male", "compass", "קצרין", "u-m05", "בנימין אוחנה", 2),
    pending("u-new-m3", "אליאב", "אליאב חזן", "male", "backpack", "ירוחם", "u-m13", "דוד מלכה", 7),
    pending("u-new-f2", "רעות", "רעות ביטון", "female", "wave", "טבריה", "u-f20", "שולה כץ", 3),
  );

  const trips: Trip[] = TRIPS.map(([id, ownerId, kind, area, place, photo, start, length, wanted, styles, description, deadline, flex], i) => {
    const dl: Deadline = typeof deadline === "number" ? { type: "daysBefore", days: deadline } : { type: "date", date: d(deadline.at) };
    const dateFlex: DateFlex | undefined = flex
      ? flex[0] === "range"
        ? { type: "range", days: flex[1] }
        : { type: "alt", startDate: d(flex[1]) }
      : kind === "planned"
        ? { type: "fixed" }
        : undefined;
    return {
      id, ownerId, kind, status: "open", area, place, photo, startDate: d(start), endDate: d(start + length - 1),
      flex: dateFlex, wanted, styles, description, deadline: dl, createdAt: ago(6 + i * 7),
    };
  });

  const requests: JoinRequest[] = REQUESTS.map(([id, tripId, fromUserId, status, note, party, hours]) => ({
    id, tripId, fromUserId, status, note, party, createdAt: ago(hours),
  }));

  const messages: Message[] = MESSAGES.map(([id, requestId, fromUserId, text, hours]) => ({ id, requestId, fromUserId, text, at: ago(hours) }));

  const reports: Report[] = [
    { id: "rep-2", fromUserId: "u-m06", aboutUserId: "u-m22", reason: "spam", text: "מציע לכולם סיור מודרך בתשלום", status: "open", createdAt: ago(10) },
    { id: "rep-3", fromUserId: "u-f13", aboutUserId: "u-f08", reason: "behavior", text: "ביטלה ברגע האחרון בלי להודיע", status: "open", createdAt: ago(31) },
  ];

  return { users, trips, requests, messages, reports };
}
