import { Shayari } from '../types';

export interface EmotionalQuestionPage {
  id: string;
  slug: string;
  heading: string;
  intro: string;
  thoughts: string[];
  similarFeelings: { label: string; url: string }[];
  relatedCategories: string[];
  matchingShayariIds: string[];
  seoTitle: string;
  seoDesc: string;
}

export const emotionalQuestionPages: EmotionalQuestionPage[] = [
  {
    id: "why-she-ignores-me",
    slug: "why-she-ignores-me",
    heading: "Why She Ignores Me: Inside the Heart's Silence 💔",
    intro: "Sach bolu… ignore hona utna dard nahi deta, jitna kisi apne ka badal jaana deta hai… Achanak conversation small talk ban jaati hai, and double texts remain unanswered. If you are constantly staring at that screen wondering what changed, you are surviving a quiet heartbreak.",
    thoughts: [
      "Inboxes don't go silent on their own. Priority changes show up in the length of their responses.",
      "Begging for attention is a fire that burns your own self-respect. If they choose silence, match their energy.",
      "Sometimes they ignore you because they are sorting their own chaos, but mostly, it is because your presence became too convenient."
    ],
    similarFeelings: [
      { label: "Lonely Nights", url: "/feeling-lonely-at-night" },
      { label: "Trust Issues", url: "/how-to-handle-breakup-pain" },
      { label: "Overthinking", url: "/overthinking-at-night" },
      { label: "Fake Love", url: "/fake-friends-thoughts" }
    ],
    relatedCategories: ["Sad", "Breakup", "Emotional"],
    matchingShayariIds: ["3", "6", "118"], // maps key pieces like khamoshi-ka-maza, dosti-aur-dhoka, etc.
    seoTitle: "Why She Ignores Me: Ultimate Emotional Thoughts & Status - Roy No Rules",
    seoDesc: "Wondering why she ignores you or remains silent? Read deep emotional relatable thoughts, custom Hinglish/Hindi shayari, and tips to protect your self-respect."
  },
  {
    id: "feeling-lonely-at-night",
    slug: "feeling-lonely-at-night",
    heading: "Feeling Lonely at Night: Dealing with Deep Silent Hours 🌙",
    intro: "Jab sab so jaate hain, tab dimaag aur dil bade shor karte hain… The silence of 2 AM makes your past mistakes, unsaid words, and fading relationships feel three times heavier. It's not the bedroom that's empty, it's the mind playing memories on a loop.",
    thoughts: [
      "The night is a catalyst for emotional truths. In the dark, you cannot pretend to be okay anymore.",
      "Being alone in a crowd is easy to ignore, but being alone with your own memories in a quiet room is the real battlefield.",
      "Give yourself grace. Those late-night tears are just the heart washing away hopes that you need to let go of."
    ],
    similarFeelings: [
      { label: "Overthinking", url: "/overthinking-at-night" },
      { label: "Missing Someone", url: "/why-she-ignores-me" },
      { label: "Emotional Pain", url: "/how-to-handle-breakup-pain" },
      { label: "Fake Friends", url: "/fake-friends-thoughts" }
    ],
    relatedCategories: ["Sad", "Emotional", "Sigma"],
    matchingShayariIds: ["3", "7", "118"],
    seoTitle: "Feeling Lonely at Night: Why 2 AM Hurts & Heart Touching Lines",
    seoDesc: "Why does midnight bring so much loneliness? Read human-style empathetic notes, evening status notes, and emotional shayari resources for sleepless nights."
  },
  {
    id: "how-to-handle-breakup-pain",
    slug: "how-to-handle-breakup-pain",
    heading: "How to Handle Breakup Pain: Surviving Unannounced Grief 🩹",
    intro: "Kisi ko tootkar chaho, fir chup-chap toot jao… That is the brutal cycle of breakup trauma. Walking away from someone who once held your whole sky isn't a single decision—it's a battle you have to fight every single morning when you wake up and remember they aren't yours anymore.",
    thoughts: [
      "Letting go doesn't mean you stop loving; it just means you choose your own sanity over their halfhearted attention.",
      "The pain in your chest has an end. Healing isn't linear, some days will feel like day one all over again, and that is completely okay.",
      "Build your own empire in silence. Let your successful rebound are not another person, but your own destiny."
    ],
    similarFeelings: [
      { label: "Trust Broken", url: "/fake-friends-thoughts" },
      { label: "Ignoring Nature", url: "/why-she-ignores-me" },
      { label: "Overthinking Waves", url: "/overthinking-at-night" },
      { label: "Lonely Shadows", url: "/feeling-lonely-at-night" }
    ],
    relatedCategories: ["Breakup", "Sad", "Sigma"],
    matchingShayariIds: ["6", "7", "118"],
    seoTitle: "How to Handle Breakup Pain: Raw Hindi Status lines to Recover In Silence",
    seoDesc: "Struggling with breakup grief and unsaid truths? Find deeply relatable emotional lines, healing thoughts, and self-worth builders on Roy No Rules."
  },
  {
    id: "fake-friends-thoughts",
    slug: "fake-friends-thoughts",
    heading: "Fake Friends & Trust Broken: The Heavy Price of Loyalty ⚔️",
    intro: "Dost kehne waale hazar hote hain, par waqt aane par hath chhodne waale hi sabse pehle dikhte hain… Nothing stings worse than realizing the person you shared your secrets with was secretly feeding on your failures. Trust is expensive; don't expect it from cheap deals.",
    thoughts: [
      "False friends only shine when the sun is bright. When your sky goes dark, they disappear like physical shadows.",
      "It is better to have limited solid corners than a wide circus of snakes who smile only when they need something.",
      "Every betrayal is a masterclass in screening. Thank them for teaching you who not to trust."
    ],
    similarFeelings: [
      { label: "Trust Issues", url: "/how-to-handle-breakup-pain" },
      { label: "Silent Ignorance", url: "/why-she-ignores-me" },
      { label: "Midnight Anxiety", url: "/overthinking-at-night" },
      { label: "Social Exclusion", url: "/feeling-lonely-at-night" }
    ],
    relatedCategories: ["Friendship", "Breakup", "Sigma"],
    matchingShayariIds: ["6", "9", "3"],
    seoTitle: "Fake Friends & Trust Broken Lines: High Contrast Friendship Reality Status",
    seoDesc: "Deeply emotional thoughts on fake friends and trust dynamics. Read raw real-world dosti-and-dhoka lines to express your self-respect."
  },
  {
    id: "overthinking-at-night",
    slug: "overthinking-at-night",
    heading: "Overthinking at Night: When the Brain Rewinds the Past 🌪️",
    intro: "Ek baat yaad rakhna... overthinking kabhi hal nahi nikaalti, humari bachi hui muskaan bhi chura leti hai. If you find yourself analyzing every look, every text, every silence, and framing scenarios that probably will never happen, you are letting thoughts hold your heart hostage.",
    thoughts: [
      "Overthinking is like a rocking chair; it keeps you moving but gets you absolutely nowhere.",
      "They aren't thinking about that text you sent three weeks ago. Let it fade into the cosmic dust.",
      "The best revenge against chaotic situations is to sleep beautifully and let the next sunrise deal with the answers."
    ],
    similarFeelings: [
      { label: "Midnight Loneliness", url: "/feeling-lonely-at-night" },
      { label: "One Sided Grief", url: "/why-she-ignores-me" },
      { label: "Silent Self-Love", url: "/how-to-handle-breakup-pain" },
      { label: "Fake Expectations", url: "/fake-friends-thoughts" }
    ],
    relatedCategories: ["Motivation", "Emotional", "Sigma"],
    matchingShayariIds: ["1", "5", "8"],
    seoTitle: "Overthinking at Night: Relatable Hindi Mood notes & High Power Lines",
    seoDesc: "Stuck in late-night overthinking loops and emotional fatigue? Read warm conversational self-care guidelines and motivational custom status cards."
  }
];
