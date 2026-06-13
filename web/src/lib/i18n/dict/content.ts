/**
 * Platform-authored DB content (NOT user-generated): subjects, achievements and
 * gamification level names. These are seeded in English on the server; the UI
 * looks them up by stable slug/code and falls back to the API-provided English
 * value when a key is missing. Keep in sync with `server/prisma/seed.ts`.
 */
export const en = {
  // Gamification level names (index = level)
  "level.1": "Beginner",
  "level.2": "Learner",
  "level.3": "Contributor",
  "level.4": "Expert",
  "level.5": "Master",

  // Achievements — keyed by achievement.code
  "achievement.FIRST_UPLOAD.name": "First Steps",
  "achievement.FIRST_UPLOAD.desc": "Upload your first note",
  "achievement.RISING_CONTRIBUTOR.name": "Rising Contributor",
  "achievement.RISING_CONTRIBUTOR.desc": "Upload 10 notes",
  "achievement.TOP_CONTRIBUTOR.name": "Top Contributor",
  "achievement.TOP_CONTRIBUTOR.desc": "Upload 25 notes",
  "achievement.DOWNLOADS_100.name": "100 Downloads",
  "achievement.DOWNLOADS_100.desc": "Reach 100 total downloads",
  "achievement.DOWNLOADS_500.name": "500 Downloads",
  "achievement.DOWNLOADS_500.desc": "Reach 500 total downloads",
  "achievement.DOWNLOADS_1000.name": "1000 Downloads",
  "achievement.DOWNLOADS_1000.desc": "Reach 1000 total downloads",
  "achievement.BEST_NOTES_AUTHOR.name": "Best Notes Author",
  "achievement.BEST_NOTES_AUTHOR.desc": "Have a note rated 4.5+ by 5+ students",
  "achievement.MOST_LIKED_CREATOR.name": "Most Liked Creator",
  "achievement.MOST_LIKED_CREATOR.desc": "Receive 100 likes across your notes",
  "achievement.VERIFIED_CONTRIBUTOR.name": "Verified Contributor",
  "achievement.VERIFIED_CONTRIBUTOR.desc":
    "Awarded to hand-picked trusted contributors",

  // Subjects — keyed by subject.slug
  "subject.physics.name": "Physics",
  "subject.physics.desc": "Mechanics, waves, electricity, modern physics and more.",
  "subject.chemistry.name": "Chemistry",
  "subject.chemistry.desc": "Organic, inorganic and physical chemistry notes.",
  "subject.biology.name": "Biology",
  "subject.biology.desc": "Botany, zoology, genetics and human physiology.",
  "subject.mathematics.name": "Mathematics",
  "subject.mathematics.desc":
    "Algebra, calculus, geometry, trigonometry and statistics.",
  "subject.ict.name": "ICT",
  "subject.ict.desc": "Programming, databases, networking and digital systems.",
  "subject.english.name": "English",
  "subject.english.desc": "Grammar, composition, literature and comprehension.",
  "subject.bangla.name": "Bangla",
  "subject.bangla.desc": "Bangla literature, grammar and creative writing.",
  "subject.civics-good-governance.name": "Civics & Good Governance",
  "subject.civics-good-governance.desc":
    "Citizenship, state structure and governance.",
  "subject.economics.name": "Economics",
  "subject.economics.desc": "Micro and macro economics, markets and development.",
  "subject.history.name": "History",
  "subject.history.desc": "World history, regional history and civilizations.",
  "subject.islamic-history-culture.name": "Islamic History & Culture",
  "subject.islamic-history-culture.desc":
    "Islamic civilization, history and heritage.",
  "subject.sociology.name": "Sociology",
  "subject.sociology.desc": "Society, culture, institutions and social change.",
  "subject.social-work.name": "Social Work",
  "subject.social-work.desc":
    "Social welfare, community development and policy.",
  "subject.logic.name": "Logic",
  "subject.logic.desc": "Deduction, induction, fallacies and reasoning.",
  "subject.geography.name": "Geography",
  "subject.geography.desc": "Physical, human and environmental geography.",
  "subject.psychology.name": "Psychology",
  "subject.psychology.desc": "Behaviour, cognition, development and mental health.",
  "subject.statistics.name": "Statistics",
  "subject.statistics.desc":
    "Probability, distributions, sampling and inference.",
  "subject.islamic-studies.name": "Islamic Studies",
  "subject.islamic-studies.desc": "Quran, hadith, fiqh and Islamic ethics.",
} as const;

export const bn: Record<keyof typeof en, string> = {
  // Level names
  "level.1": "শিক্ষানবিশ",
  "level.2": "শিক্ষার্থী",
  "level.3": "অবদানকারী",
  "level.4": "বিশেষজ্ঞ",
  "level.5": "মাস্টার",

  // Achievements
  "achievement.FIRST_UPLOAD.name": "প্রথম পদক্ষেপ",
  "achievement.FIRST_UPLOAD.desc": "আপনার প্রথম নোট আপলোড করুন",
  "achievement.RISING_CONTRIBUTOR.name": "উদীয়মান অবদানকারী",
  "achievement.RISING_CONTRIBUTOR.desc": "১০টি নোট আপলোড করুন",
  "achievement.TOP_CONTRIBUTOR.name": "শীর্ষ অবদানকারী",
  "achievement.TOP_CONTRIBUTOR.desc": "২৫টি নোট আপলোড করুন",
  "achievement.DOWNLOADS_100.name": "১০০ ডাউনলোড",
  "achievement.DOWNLOADS_100.desc": "মোট ১০০ ডাউনলোডে পৌঁছান",
  "achievement.DOWNLOADS_500.name": "৫০০ ডাউনলোড",
  "achievement.DOWNLOADS_500.desc": "মোট ৫০০ ডাউনলোডে পৌঁছান",
  "achievement.DOWNLOADS_1000.name": "১০০০ ডাউনলোড",
  "achievement.DOWNLOADS_1000.desc": "মোট ১০০০ ডাউনলোডে পৌঁছান",
  "achievement.BEST_NOTES_AUTHOR.name": "সেরা নোট লেখক",
  "achievement.BEST_NOTES_AUTHOR.desc":
    "৫+ শিক্ষার্থীর কাছ থেকে ৪.৫+ রেটিং পাওয়া একটি নোট রাখুন",
  "achievement.MOST_LIKED_CREATOR.name": "সর্বাধিক পছন্দের নির্মাতা",
  "achievement.MOST_LIKED_CREATOR.desc": "আপনার নোটগুলোতে মোট ১০০টি লাইক পান",
  "achievement.VERIFIED_CONTRIBUTOR.name": "যাচাইকৃত অবদানকারী",
  "achievement.VERIFIED_CONTRIBUTOR.desc":
    "বাছাই করা বিশ্বস্ত অবদানকারীদের দেওয়া হয়",

  // Subjects
  "subject.physics.name": "পদার্থবিজ্ঞান",
  "subject.physics.desc": "বলবিদ্যা, তরঙ্গ, তড়িৎ, আধুনিক পদার্থবিজ্ঞান এবং আরও অনেক কিছু।",
  "subject.chemistry.name": "রসায়ন",
  "subject.chemistry.desc": "জৈব, অজৈব এবং ভৌত রসায়নের নোট।",
  "subject.biology.name": "জীববিজ্ঞান",
  "subject.biology.desc": "উদ্ভিদবিদ্যা, প্রাণিবিদ্যা, জিনতত্ত্ব এবং মানব শারীরবিদ্যা।",
  "subject.mathematics.name": "গণিত",
  "subject.mathematics.desc": "বীজগণিত, ক্যালকুলাস, জ্যামিতি, ত্রিকোণমিতি এবং পরিসংখ্যান।",
  "subject.ict.name": "আইসিটি",
  "subject.ict.desc": "প্রোগ্রামিং, ডেটাবেস, নেটওয়ার্কিং এবং ডিজিটাল সিস্টেম।",
  "subject.english.name": "ইংরেজি",
  "subject.english.desc": "ব্যাকরণ, রচনা, সাহিত্য এবং অনুধাবন।",
  "subject.bangla.name": "বাংলা",
  "subject.bangla.desc": "বাংলা সাহিত্য, ব্যাকরণ এবং সৃজনশীল লেখা।",
  "subject.civics-good-governance.name": "পৌরনীতি ও সুশাসন",
  "subject.civics-good-governance.desc": "নাগরিকত্ব, রাষ্ট্রকাঠামো এবং সুশাসন।",
  "subject.economics.name": "অর্থনীতি",
  "subject.economics.desc": "ব্যষ্টিক ও সামষ্টিক অর্থনীতি, বাজার এবং উন্নয়ন।",
  "subject.history.name": "ইতিহাস",
  "subject.history.desc": "বিশ্ব ইতিহাস, আঞ্চলিক ইতিহাস এবং সভ্যতা।",
  "subject.islamic-history-culture.name": "ইসলামের ইতিহাস ও সংস্কৃতি",
  "subject.islamic-history-culture.desc": "ইসলামী সভ্যতা, ইতিহাস এবং ঐতিহ্য।",
  "subject.sociology.name": "সমাজবিজ্ঞান",
  "subject.sociology.desc": "সমাজ, সংস্কৃতি, প্রতিষ্ঠান এবং সামাজিক পরিবর্তন।",
  "subject.social-work.name": "সমাজকর্ম",
  "subject.social-work.desc": "সমাজকল্যাণ, কমিউনিটি উন্নয়ন এবং নীতি।",
  "subject.logic.name": "যুক্তিবিদ্যা",
  "subject.logic.desc": "অবরোহ, আরোহ, হেত্বাভাস এবং যুক্তি।",
  "subject.geography.name": "ভূগোল",
  "subject.geography.desc": "প্রাকৃতিক, মানবিক এবং পরিবেশগত ভূগোল।",
  "subject.psychology.name": "মনোবিজ্ঞান",
  "subject.psychology.desc": "আচরণ, জ্ঞান, বিকাশ এবং মানসিক স্বাস্থ্য।",
  "subject.statistics.name": "পরিসংখ্যান",
  "subject.statistics.desc": "সম্ভাবনা, বণ্টন, নমুনায়ন এবং অনুমান।",
  "subject.islamic-studies.name": "ইসলাম শিক্ষা",
  "subject.islamic-studies.desc": "কুরআন, হাদিস, ফিকহ এবং ইসলামী নীতিশাস্ত্র।",
};
