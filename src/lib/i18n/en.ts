import type { Dict } from "./he";
import { durationParts, type DurationUnit } from "../dates";

const unitText = (unit: DurationUnit, n: number) =>
  `${n} ${unit === "days" ? (n === 1 ? "day" : "days") : unit === "weeks" ? (n === 1 ? "week" : "weeks") : n === 1 ? "month" : "months"}`;

/** "2 weeks and 1 day", "1 month and 2 weeks" */
const duration = (days: number) =>
  durationParts(days)
    .map((p) => unitText(p.unit, p.n))
    .join(" and ");

export const en: Dict = {
  appName: "Travel Partner",

  duration,
  countdown: (days) => {
    const [first, ...rest] = durationParts(days);
    const word = unitText(first.unit, first.n).replace(/^\d+ /, "");
    return { n: first.n, label: [word, ...rest.map((p) => unitText(p.unit, p.n))].join(" and ") };
  },
  tagline: "Going on a trip? Find partners for the road",

  greeting: {
    morning: (name) => `Good morning, ${name}`,
    noon: (name) => `Good afternoon, ${name}`,
    evening: (name) => `Good evening, ${name}`,
  },

  home: {
    headline: "Where to this time?",
    all: "All",
  },

  nav: {
    trips: "Trips",
    my: "My trips",
    new: "Post",
    chats: "Chats",
    profile: "Profile",
  },

  section: {
    male: "Men's section",
    female: "Women's section",
  },
  postedIn: {
    male: "in the men's section",
    female: "in the women's section",
  },
  bothSections: "in both sections",

  demo: {
    banner: "Prototype · sample data",
    viewAs: "View as",
    tools: "Prototype tools",
    reset: "Reset sample data",
    resetDone: "Sample data reset",
    simulateAccept: "Demo: simulate the owner accepting",
    signUp: "Sign-up flow",
    admin: "Section admin screen",
  },

  gender: {
    male: "Man",
    female: "Woman",
  },

  kind: {
    planned: "Planned",
    closed: "Confirmed",
  },
  kindTab: {
    planned: "Planned",
    closed: "Confirmed",
  },
  kindHint: {
    planned: "Trip ideas that happen if partners are found",
    closed: "Trips that are definitely happening — join if it suits you",
  },

  area: {
    north: "North",
    center: "Center",
    jerusalem: "Jerusalem",
    south: "South & Eilat",
    europe: "Europe",
    usa: "USA",
    asia: "Asia",
    other: "Other",
  },

  wanted: {
    male: { one: "One partner", few: "A few people", families: "Families" },
    female: { one: "One partner", few: "A few people", families: "Families" },
  },

  style: {
    hiking: "Hiking",
    nature: "Nature",
    cities: "Cities",
    relaxed: "Relaxed",
    adventure: "Adventure",
    shabbat: "Shabbat on the trip",
    food: "Kosher food",
  },

  partyType: {
    solo: "Solo",
    group: "With others",
    family: "Family",
  },
  partyText: (p) => {
    if (p.type === "solo") return "Solo";
    if (p.type === "group") return p.others <= 0 ? "With others" : p.others === 1 ? "With 1 other" : `With ${p.others} others`;
    const parents = p.parents === 1 ? "1 parent" : "2 parents";
    return p.kids === 0 ? `Family: ${parents}` : `Family: ${parents} and ${p.kids === 1 ? "1 child" : `${p.kids} children`}`;
  },
  partyForm: {
    others: "How many others (optional)",
    note: "Note (optional)",
    notePlaceholder: "e.g. Two friends from the community",
    parents: "Parents",
    oneParent: "1 parent",
    twoParents: "2 parents",
    kids: "Children",
  },

  ageGroup: {
    "18-25": "18–25",
    "26-35": "26–35",
    "36-50": "36–50",
    "50+": "50+",
  },
  ageLabel: (group) => `Age ${group}`,

  observance: {
    strict: "Mehadrin",
    kosher: "Kosher & Shabbat",
    traditional: "Traditional",
  },

  pace: {
    easy: "Easy pace",
    medium: "Medium pace",
    hard: "Challenging pace",
  },

  tier: {
    bronze: "Bronze",
    silver: "Silver",
    gold: "Gold",
  },
  points: (n) => `${n} pts`,
  stats: (trips, joined) => `${trips} trips · ${joined} joined`,
  pointsTitle: "Points",
  statLabel: { trips: "Trips", joined: "Joined" },
  pointsExplain: "Points for trips people joined: 10 per trip and 5 per person. Later on — prizes abroad.",

  feed: {
    area: "Area",
    allAreas: "All areas",
    wanted: "Looking for",
    anyWanted: "Anyone",
    month: "When",
    anyMonth: "Any dates",
    count: (n) => (n === 1 ? "1 trip" : `${n} trips`),
    empty: "No trips match these filters right now",
    clear: "Clear filters",
  },

  trip: {
    depart: "Depart",
    return: "Return",
    toGo: "to go",
    toGoAbout: "to go, roughly",
    openUntil: (date) => `Open to join until ${date}`,
    closesIn: (n) => (n <= 0 ? "closes today" : n === 1 ? "closes tomorrow" : `${duration(n)} left`),
    daysBefore: (n) => `Until ${duration(n)} before departure`,
    or: (date) => `or ${date}`,
    plusMinus: (days) => `± ${duration(days)}`,
    notFinal: "Dates not final",
    flexible: "Flexible dates",
    about: "About the trip",
    lookingFor: "Looking for",
    style: "Style",
    postedBy: "Posted by",
    askToJoin: "Ask to join",
    contactRule: "Chat opens only after the request is accepted. Contact details are never shown.",
    requestPending: "Request sent — waiting for approval",
    requestAccepted: "Request accepted — you can talk now",
    requestDeclined: "The request wasn't accepted",
    openChat: "Open chat",
    yours: "This is your trip",
    manage: "Requests",
    closedToRequests: "This trip is closed to new partners",
    full: "Partners found",
    notFound: "Trip not found",
    back: "Back",
    requests: (n) => (n === 1 ? "1 request" : `${n} requests`),
    families: "Family trip",
    edit: "Edit",
  },

  join: {
    title: "Ask to join",
    noteLabel: "A short note with your request",
    notePlaceholder: "e.g. Two brothers from Jerusalem, easy pace",
    familiesHint: "A family trip — pick 'Family' and say who's coming",
    party: "Who's coming?",
    plannedNote: "This trip is still planned. Your request waits until the trip is confirmed.",
    send: "Send request",
    cancel: "Cancel",
    sent: "Request sent",
  },

  newTrip: {
    title: "Post a trip",
    editTitle: "Edit trip",
    kindQuestion: "What kind of trip?",
    plannedTitle: "Planned trip",
    plannedDesc: "An idea that happens if partners are found",
    free: "Free",
    plannedLimitReached: "You already have 2 planned trips. Confirm one of them or post a confirmed trip.",
    closedTitle: "Confirmed trip",
    closedDesc: "Definitely happening — you can accept partners",
    betaFree: "Free in beta",
    stayClosed: "A confirmed trip stays confirmed",
    place: "Where to?",
    placePlaceholder: "e.g. The Dolomites, northern Italy",
    area: "Area",
    pickArea: "Pick an area",
    cover: "Cover photo",
    from: "Depart",
    to: "Return",
    flexTitle: "How settled are the dates?",
    flex: {
      fixed: "Only these dates",
      alt: "Another departure date",
      range: "Flexible by days or weeks",
    },
    altDate: "Another departure date",
    altReturn: (date) => `returning ${date}`,
    rangeLabel: "Flexible by, earlier or later",
    unit: { days: "days", weeks: "weeks" },
    wanted: "Who are you looking for?",
    familiesNote: "Family trips show in the men's section and the women's section",
    styles: "Trip style (pick any)",
    description: "Description",
    descriptionPlaceholder: "What's planned, pace, difficulty, Shabbat, food…",
    deadline: "Looking for partners until when?",
    deadlineDate: "Until a date",
    deadlineDays: "Days before departure",
    daysBeforeSuffix: "days before departure",
    postedIn: (where) => `The trip will be posted ${where}`,
    publish: "Post the trip",
    save: "Save changes",
    toPayment: "Continue to confirm the trip",
    published: "Trip posted",
    saved: "Changes saved",
    errors: {
      place: "Say where you're going",
      area: "Pick an area",
      dates: "Pick the dates",
      order: "The return date is before the departure date",
      past: "The departure date has already passed",
      deadline: "The deadline must be between today and departure",
      alt: "Pick another departure date — different from the first, and not in the past",
    },
  },

  payment: {
    title: "Confirm the trip",
    explain: "On a confirmed trip you see the full details of people who ask to join, and you can accept them. Everyone who joins adds to your points.",
    once: "One-time fee per trip",
    beta: "Free during the beta",
    demo: "This is a prototype — nothing will be charged.",
    payBeta: "Confirm the trip — free in beta",
    back: "Back",
    done: "Trip confirmed — you can accept partners",
  },

  my: {
    title: "My trips",
    posts: "Posted",
    sent: "Requests sent",
    incoming: "Requests to join",
    noRequests: "No requests yet",
    accept: "Accept",
    decline: "Decline",
    status: {
      pending: "Pending",
      accepted: "Accepted",
      declined: "Declined",
    },
    emptyPosts: "You haven't posted a trip yet",
    postTrip: "Post a trip",
    emptySent: "You haven't asked to join any trip yet",
    browse: "Browse trips",
    notOpen: "Not taking requests",
    locked: "Full details open once the trip is confirmed",
    unlock: "Confirm the trip and accept partners",
    foundPartners: "Found partners",
    reopen: "Open for requests again",
    delete: "Delete",
    confirmDelete: "Delete this trip? Its requests and chats will be deleted too.",
    deleted: "Trip deleted",
  },

  chat: {
    title: "Chats",
    empty: "No chats yet. A chat opens when a request to join is accepted.",
    about: (place) => `About: ${place}`,
    acceptedLine: "Request accepted — you can talk from here",
    safety: "Meet in a public place the first time",
    safetyLink: "Safety tips",
    placeholder: "Write a message…",
    send: "Send",
    locked: "You don't have access to this chat",
  },

  moderation: {
    menu: "Options",
    report: "Report",
    block: "Block",
    reportTitle: (name) => `Report ${name}`,
    reason: {
      behavior: "Inappropriate behavior",
      fake: "Fake profile or wrong section",
      spam: "Spam or advertising",
      other: "Other",
    },
    details: "Details (optional)",
    sendReport: "Send report",
    reported: "Report sent to the section's admins",
    blockConfirm: (name) => `Block ${name}? You won't see each other, and the chat will close.`,
    blocked: "Blocked",
    cancel: "Cancel",
  },

  profile: {
    title: "Profile",
    nickname: "Nickname",
    avatar: "Avatar",
    gender: "Section",
    genderLocked: "Set at sign-up and can't be changed",
    party: "Who you travel with",
    fullName: "Full name",
    phone: "Phone",
    privateTitle: "Personal details",
    privateNote: "Never shown to anyone — only the section's admins",
    phoneVerified: "Verified by SMS",
    ageGroup: "Age group",
    observance: "Observance",
    pace: "Pace & fitness",
    city: "City",
    about: "About me",
    save: "Save",
    saved: "Saved",
    notifications: "Notifications",
    push: "Phone notifications",
    email: "Email",
    language: "Language",
    safety: "Safety & terms",
  },

  welcome: {
    title: "Find partners for the road",
    subtitle: "A religious travel community, with a men's section and a women's section",
    start: "Sign up",
    inviteOnly: "Joining is by recommendation from someone already in the community",
    step: (n, total) => `Step ${n} of ${total}`,
    phoneTitle: "What's your phone number?",
    phoneHint: "We'll text you a code. Your number is never shown to anyone.",
    phone: "Phone",
    sendCode: "Send code",
    codeTitle: "The code you got",
    codeHint: (phone) => `We sent a code to ${phone}`,
    demoCode: "In the demo: any 4 digits",
    verify: "Verify",
    aboutTitle: "About you",
    genderWarn: "Can't be changed later",
    styleTitle: "How do you travel?",
    referralTitle: "Who recommends you?",
    referralHint:
      "Someone in the community, from the same section. Write their full name and phone number, so the section's admins can check the recommendation.",
    referralName: "Their full name",
    referralPhone: "Their phone",
    referralNotFound: "That number isn't registered in the section",
    referralExamples: (names) => `In the demo: ${names}`,
    fullNameHint: "Never shown to anyone — only the section's admins",
    submit: "Send for approval",
    pendingTitle: "Sign-up sent!",
    pendingText: (name) =>
      `We asked ${name} to recommend you. Then the section's admins will approve your sign-up, and we'll let you know.`,
    demoApprove: "Demo: approve and go in",
    next: "Continue",
    back: "Back",
    errors: {
      phone: "Enter a valid phone number",
      code: "Enter 4 digits",
      nickname: "Pick a nickname",
      fullName: "Enter a full name — first and last",
      gender: "Pick a section",
    },
  },

  admin: {
    title: "Section admin",
    pending: "Waiting",
    reports: "Reports",
    users: "Members",
    recommendedBy: (name) => `Recommended by ${name}`,
    approve: "Approve",
    reject: "Reject",
    noPending: "No one is waiting for approval",
    noReports: "No open reports",
    reportOf: (from, about) => `${from} reported ${about}`,
    suspend: "Suspend",
    restore: "Restore",
    dismiss: "Close report",
    suspended: "Suspended",
    approved: "Member approved",
    privateDetails: "For the admins",
    referral: "Recommendation",
    typedName: (name) => `Typed: ${name}`,
    nameMatches: "Matches the name on file",
    nameDiffers: (registered) => `Doesn't match the name on file (${registered})`,
    call: "Call",
  },

  safety: {
    title: "Safety & terms",
    tipsTitle: "Before you head out with new partners",
    tips: [
      "Have the first conversation here in the app, without giving out your phone or address.",
      "Meet for the first time in a public place, during the day.",
      "Tell someone close where you're going, with whom and when you'll be back.",
      "Don't send money in advance to people you don't know.",
      "Something doesn't feel right? Block and report — the section's admins check every report.",
    ],
    photosTitle: "Photos",
    photosText: "Photos courtesy of Unsplash photographers, under a license that allows free use.",
    termsTitle: "Terms & privacy policy",
    termsText: "The full text will be written before launch, with a lawyer.",
  },

  langSwitch: "עברית",
};
