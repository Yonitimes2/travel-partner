import type { Dict } from "./he";

export const en: Dict = {
  appName: "Travel Partner",
  tagline: "Going on a trip? Find partners for the road",

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

  demo: {
    banner: "Prototype · sample data",
    viewAs: "View as",
    tools: "Prototype tools",
    reset: "Reset sample data",
    resetDone: "Sample data reset",
    simulateAccept: "Demo: simulate the owner accepting",
  },

  gender: {
    male: "Man",
    female: "Woman",
  },

  kind: {
    planned: "Planned",
    booked: "Booked",
  },
  kindTab: {
    planned: "Planned",
    booked: "Booked",
  },
  kindHint: {
    planned: "Trip ideas that happen if partners are found",
    booked: "Trips already booked — join if it suits you",
  },

  area: {
    north: "North",
    center: "Center",
    jerusalem: "Jerusalem area",
    south: "South & Eilat",
    europe: "Europe",
    usa: "USA",
    asia: "Asia",
    other: "Other",
  },

  wanted: {
    male: { one: "One partner", few: "A few people", families: "Families only" },
    female: { one: "One partner", few: "A few people", families: "Families only" },
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

  travelsAs: {
    solo: "Solo",
    family: "With family",
  },

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
    days: (n) => (n === 1 ? "1 day" : `${n} days`),
    openUntil: (date) => `Open to join until ${date}`,
    closesIn: (n) => (n <= 0 ? "closes today" : n === 1 ? "closes tomorrow" : `${n} days left`),
    daysBefore: (n) => `Until ${n} days before departure`,
    about: "About the trip",
    lookingFor: "Looking for",
    style: "Style",
    joining: "Joining",
    postedBy: "Posted by",
    askToJoin: "Ask to join",
    contactRule: "Chat opens only after the request is accepted. Contact details are never shown.",
    requestPending: "Request sent — waiting for approval",
    requestAccepted: "Request accepted — you can talk now",
    requestDeclined: "The request wasn't accepted",
    openChat: "Open chat",
    yours: "This is your trip",
    manage: "See requests",
    closed: "This trip is closed to new partners",
    notFound: "Trip not found",
    back: "Back",
    requests: (n) => (n === 1 ? "1 request" : `${n} requests`),
  },

  join: {
    title: "Ask to join",
    noteLabel: "A short note with your request",
    notePlaceholder: "e.g. Two brothers from Jerusalem, easy pace",
    familiesHint: "This trip is for families only — say who in your family is coming",
    send: "Send request",
    cancel: "Cancel",
    sent: "Request sent",
  },

  newTrip: {
    title: "Post a trip",
    kindQuestion: "What kind of trip?",
    plannedTitle: "Planned trip",
    plannedDesc: "An idea that happens if partners are found",
    plannedPrice: "Free",
    bookedTitle: "Booked trip",
    bookedDesc: "Already booked — anyone can ask to join",
    bookedPrice: (price) => `${price} one-time`,
    place: "Where to?",
    placePlaceholder: "e.g. The Dolomites, northern Italy",
    area: "Area",
    pickArea: "Pick an area",
    from: "From",
    to: "To",
    wanted: "Who are you looking for?",
    styles: "Trip style (pick any)",
    description: "Description",
    descriptionPlaceholder: "What's planned, pace, difficulty, Shabbat, food…",
    deadline: "Looking for partners until when?",
    deadlineDate: "Until a date",
    deadlineDays: "Days before departure",
    daysBeforeSuffix: "days before departure",
    postedIn: (where) => `The trip will be posted ${where}`,
    publish: "Post the trip",
    toPayment: "Continue to payment",
    published: "Trip posted",
    errors: {
      place: "Say where you're going",
      area: "Pick an area",
      dates: "Pick the dates",
      order: "The end date is before the start date",
      past: "The start date has already passed",
      deadline: "The deadline must be between today and departure",
    },
  },

  payment: {
    title: "Pay to post",
    once: "A one-time fee for this trip. Posting a planned trip is free.",
    demo: "This is a prototype — nothing will be charged. The price is only an example.",
    pay: (price) => `Pay ${price} (demo)`,
    back: "Back to editing",
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
    closed: "Closed",
  },

  chat: {
    title: "Chats",
    empty: "No chats yet. A chat opens when a request to join is accepted.",
    about: (place) => `About: ${place}`,
    acceptedLine: "Request accepted — you can talk from here",
    placeholder: "Write a message…",
    send: "Send",
    locked: "You don't have access to this chat",
  },

  profile: {
    title: "Profile",
    nickname: "Nickname",
    avatar: "Avatar",
    gender: "Gender",
    genderLocked: "Set at sign-up and can't be changed",
    travelsAs: "How you travel",
    city: "City",
    about: "About me",
    save: "Save",
    saved: "Saved",
  },

  langSwitch: "עברית",
};
