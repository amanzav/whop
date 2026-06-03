import type {
  Category,
  Message,
  Offer,
  Order,
  Review,
  Service,
  Task,
  User,
} from "@/lib/types";

// The two identities the persona switcher acts as.
export const BUYER_USER_ID = "u_you_buyer";
export const SELLER_USER_ID = "u_you_seller";

const day = 86_400_000;
const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * day).toISOString();

export const categories: Category[] = [
  { id: "cat_community", name: "Community Setup", icon: "Users" },
  { id: "cat_course", name: "Course Creation", icon: "GraduationCap" },
  { id: "cat_trading", name: "Trading Bots", icon: "TrendingUp" },
  { id: "cat_growth", name: "Growth & Marketing", icon: "Megaphone" },
  { id: "cat_ai", name: "AI Agents", icon: "Bot" },
  { id: "cat_design", name: "Brand/Design", icon: "Palette" },
  { id: "cat_video", name: "Video Editing", icon: "Clapperboard" },
];

export const users: User[] = [
  {
    id: BUYER_USER_ID,
    name: "Jordan Blake",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=jordan",
    bio: "Founder building a paid community. Commissioning work to launch faster.",
    roles: ["Buyer"],
    skills: [],
    categoryIds: [],
    ratingAvg: 4.9,
    reviewCount: 6,
    completedOrderCount: 4,
    balance: 0,
    createdAt: iso(220),
  },
  {
    id: SELLER_USER_ID,
    name: "Avery Chen",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=avery",
    bio: "Full-stack community + automation specialist. Whop power seller since day one.",
    roles: ["Seller", "Buyer"],
    skills: ["Discord", "Automation", "Whop Apps", "Zapier", "Onboarding"],
    categoryIds: ["cat_community", "cat_ai", "cat_growth"],
    ratingAvg: 4.8,
    reviewCount: 27,
    completedOrderCount: 31,
    balance: 4820,
    createdAt: iso(400),
  },
  {
    id: "u_maya",
    name: "Maya Rodriguez",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=maya",
    bio: "Course architect. I turn your expertise into a polished, high-converting course.",
    roles: ["Seller"],
    skills: ["Curriculum", "Video", "Copywriting", "Course Design"],
    categoryIds: ["cat_course", "cat_video"],
    ratingAvg: 4.95,
    reviewCount: 58,
    completedOrderCount: 64,
    balance: 12100,
    createdAt: iso(500),
  },
  {
    id: "u_dex",
    name: "Dex Okafor",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=dex",
    bio: "Algo trader & bot dev. Custom trading bots with backtesting included.",
    roles: ["Seller"],
    skills: ["Python", "Trading", "Backtesting", "APIs", "Automation"],
    categoryIds: ["cat_trading", "cat_ai"],
    ratingAvg: 4.7,
    reviewCount: 22,
    completedOrderCount: 24,
    balance: 8600,
    createdAt: iso(300),
  },
  {
    id: "u_lena",
    name: "Lena Voss",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=lena",
    bio: "Brand designer for creators. Logos, kits, and Whop storefronts that pop.",
    roles: ["Seller"],
    skills: ["Branding", "Figma", "Logo Design", "UI"],
    categoryIds: ["cat_design"],
    ratingAvg: 4.85,
    reviewCount: 41,
    completedOrderCount: 47,
    balance: 9300,
    createdAt: iso(260),
  },
  {
    id: "u_kofi",
    name: "Kofi Mensah",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=kofi",
    bio: "Growth marketer. Paid acquisition and viral launch campaigns for communities.",
    roles: ["Seller"],
    skills: ["Marketing", "Ads", "Funnels", "Copywriting"],
    categoryIds: ["cat_growth"],
    ratingAvg: 4.4,
    reviewCount: 9,
    completedOrderCount: 8,
    balance: 1900,
    createdAt: iso(90),
  },
  {
    id: "u_rin",
    name: "Rin Takahashi",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=rin",
    bio: "AI agent builder. Custom GPT assistants and automations for your members.",
    roles: ["Seller"],
    skills: ["AI", "LLMs", "Automation", "Python", "Prompting"],
    categoryIds: ["cat_ai", "cat_community"],
    ratingAvg: 4.6,
    reviewCount: 14,
    completedOrderCount: 13,
    balance: 3400,
    createdAt: iso(140),
  },
  {
    id: "u_sol",
    name: "Sol Martinez",
    avatar: "https://api.dicebear.com/9.x/glass/svg?seed=sol",
    bio: "Video editor for course creators and clippers. Fast turnaround, clean cuts.",
    roles: ["Seller"],
    skills: ["Video", "Editing", "Motion Graphics"],
    categoryIds: ["cat_video"],
    ratingAvg: 0,
    reviewCount: 0,
    completedOrderCount: 0,
    balance: 0,
    createdAt: iso(12),
  },
];

const pkg = (
  tier: "basic" | "standard" | "premium",
  name: string,
  price: number,
  deliveryDays: number,
  features: string[],
) => ({ tier, name, price, deliveryDays, features });

export const services: Service[] = [
  {
    id: "svc_avery_community",
    sellerId: SELLER_USER_ID,
    title: "I will set up your entire Whop community + Discord",
    description:
      "Done-for-you community setup: Whop storefront, Discord server with roles and automations, onboarding flow, and welcome sequence. Launch-ready in days.",
    categoryId: "cat_community",
    images: [],
    packages: [
      pkg("basic", "Starter", 150, 3, [
        "Discord server setup",
        "Roles & channels",
        "Basic onboarding",
      ]),
      pkg("standard", "Growth", 350, 5, [
        "Everything in Starter",
        "Whop storefront setup",
        "Automated welcome flow",
        "2 integrations",
      ]),
      pkg("premium", "Scale", 750, 7, [
        "Everything in Growth",
        "Custom Whop app config",
        "Advanced automations",
        "30-day support",
      ]),
    ],
    ratingAvg: 4.8,
    reviewCount: 27,
    createdAt: iso(180),
  },
  {
    id: "svc_maya_course",
    sellerId: "u_maya",
    title: "I will design and produce your online course",
    description:
      "From outline to polished modules. Curriculum design, scripting, and edited video lessons that convert browsers into buyers.",
    categoryId: "cat_course",
    images: [],
    packages: [
      pkg("basic", "Outline", 200, 4, [
        "Course outline",
        "Module breakdown",
        "Lesson scripts (3)",
      ]),
      pkg("standard", "Produced", 600, 10, [
        "Everything in Outline",
        "5 edited video lessons",
        "Slides & worksheets",
      ]),
      pkg("premium", "Full Launch", 1500, 21, [
        "Everything in Produced",
        "12 edited lessons",
        "Sales page copy",
        "Launch checklist",
      ]),
    ],
    ratingAvg: 4.95,
    reviewCount: 58,
    createdAt: iso(150),
  },
  {
    id: "svc_dex_bot",
    sellerId: "u_dex",
    title: "I will build a custom crypto trading bot with backtesting",
    description:
      "Custom trading bot tailored to your strategy. Exchange APIs, risk controls, and a full backtest report so you trust it before going live.",
    categoryId: "cat_trading",
    images: [],
    packages: [
      pkg("basic", "Signal Bot", 300, 5, [
        "Single strategy",
        "1 exchange",
        "Backtest summary",
      ]),
      pkg("standard", "Auto Trader", 800, 10, [
        "Multi-strategy",
        "2 exchanges",
        "Risk management",
        "Full backtest report",
      ]),
      pkg("premium", "Quant Suite", 2000, 18, [
        "Everything in Auto Trader",
        "Custom indicators",
        "Dashboard",
        "30-day tuning",
      ]),
    ],
    ratingAvg: 4.7,
    reviewCount: 22,
    createdAt: iso(120),
  },
  {
    id: "svc_lena_brand",
    sellerId: "u_lena",
    title: "I will design a bold brand identity for your community",
    description:
      "Logo, color system, typography, and a Whop storefront design that makes your brand unforgettable.",
    categoryId: "cat_design",
    images: [],
    packages: [
      pkg("basic", "Logo", 120, 3, ["Primary logo", "2 concepts", "Files"]),
      pkg("standard", "Brand Kit", 400, 6, [
        "Logo suite",
        "Color & type system",
        "Social templates",
      ]),
      pkg("premium", "Full Identity", 900, 12, [
        "Everything in Brand Kit",
        "Whop storefront design",
        "Brand guidelines",
      ]),
    ],
    ratingAvg: 4.85,
    reviewCount: 41,
    createdAt: iso(100),
  },
  {
    id: "svc_rin_agent",
    sellerId: "u_rin",
    title: "I will build a custom AI agent for your members",
    description:
      "A custom GPT-powered assistant trained on your content, wired into Discord or Whop to answer member questions 24/7.",
    categoryId: "cat_ai",
    images: [],
    packages: [
      pkg("basic", "Assistant", 250, 4, [
        "Custom GPT",
        "Trained on your docs",
        "Discord bot",
      ]),
      pkg("standard", "Agent", 650, 8, [
        "Everything in Assistant",
        "Multi-tool actions",
        "Whop integration",
      ]),
      pkg("premium", "Autonomous", 1400, 15, [
        "Everything in Agent",
        "Workflow automations",
        "Analytics",
        "Support",
      ]),
    ],
    ratingAvg: 4.6,
    reviewCount: 14,
    createdAt: iso(70),
  },
  {
    id: "svc_kofi_growth",
    sellerId: "u_kofi",
    title: "I will run a viral launch campaign for your Whop",
    description:
      "Paid ads, funnel, and launch sequence to flood your community with members in the first 30 days.",
    categoryId: "cat_growth",
    images: [],
    packages: [
      pkg("basic", "Funnel", 180, 4, ["Landing funnel", "Email sequence"]),
      pkg("standard", "Campaign", 500, 8, [
        "Everything in Funnel",
        "Ad creative",
        "2-week ad management",
      ]),
      pkg("premium", "Blitz", 1100, 14, [
        "Everything in Campaign",
        "Influencer outreach",
        "30-day management",
      ]),
    ],
    ratingAvg: 4.4,
    reviewCount: 9,
    createdAt: iso(40),
  },
];

export const tasks: Task[] = [
  {
    id: "task_bot",
    buyerId: BUYER_USER_ID,
    title: "Need a Telegram trading bot for my signals group",
    description:
      "Looking for a developer to build a bot that posts my trade signals to Telegram automatically and tracks performance. Strategy is already defined.",
    categoryId: "cat_trading",
    requiredSkills: ["Python", "Trading", "APIs"],
    budgetMin: 400,
    budgetMax: 900,
    status: "open",
    createdAt: iso(3),
  },
  {
    id: "task_onboarding",
    buyerId: BUYER_USER_ID,
    title: "Automate onboarding for my Whop community",
    description:
      "Want an automated welcome + onboarding flow when new members join my Whop and Discord. Roles, intro DMs, and a getting-started checklist.",
    categoryId: "cat_community",
    requiredSkills: ["Discord", "Automation", "Onboarding"],
    budgetMin: 200,
    budgetMax: 500,
    status: "open",
    createdAt: iso(1),
  },
  {
    id: "task_brand",
    buyerId: "u_kofi",
    title: "Rebrand for a premium investing community",
    description:
      "Need a fresh, premium brand identity — logo, colors, and storefront. Going for a sophisticated, high-trust look.",
    categoryId: "cat_design",
    requiredSkills: ["Branding", "Figma", "Logo Design"],
    budgetMin: 300,
    budgetMax: 700,
    status: "open",
    createdAt: iso(5),
  },
];

export const offers: Offer[] = [
  {
    id: "offer_dex_bot",
    taskId: "task_bot",
    sellerId: "u_dex",
    price: 750,
    deliveryDays: 8,
    message:
      "I've built 20+ trading bots. I can wire your signals into Telegram with performance tracking and a backtest of your strategy. Let's ship it.",
    status: "pending",
    matchScore: 94,
    createdAt: iso(2),
  },
  {
    id: "offer_rin_bot",
    taskId: "task_bot",
    sellerId: "u_rin",
    price: 600,
    deliveryDays: 10,
    message:
      "I can build this with a clean Python service plus an AI layer to summarize daily performance for your members.",
    status: "pending",
    matchScore: 81,
    createdAt: iso(1),
  },
  {
    id: "offer_you_onboarding",
    taskId: "task_onboarding",
    sellerId: SELLER_USER_ID,
    price: 350,
    deliveryDays: 5,
    message:
      "Onboarding automation is my specialty — I'll set up roles, welcome DMs, and a checklist across Whop + Discord. This is exactly what I do.",
    status: "pending",
    matchScore: 96,
    createdAt: iso(0),
  },
];

export const orders: Order[] = [
  // In-progress gig order: buyer persona hired Maya for a course.
  {
    id: "order_course",
    buyerId: BUYER_USER_ID,
    sellerId: "u_maya",
    title: "Produced — Online course production",
    amount: 600,
    platformFee: 60,
    status: "in_progress",
    source: "gig",
    serviceId: "svc_maya_course",
    packageTier: "standard",
    createdAt: iso(6),
  },
  // Held gig order: buyer persona just bought the seller persona's community setup.
  {
    id: "order_community",
    buyerId: BUYER_USER_ID,
    sellerId: SELLER_USER_ID,
    title: "Growth — Whop community setup",
    amount: 350,
    platformFee: 35,
    status: "held",
    source: "gig",
    serviceId: "svc_avery_community",
    packageTier: "standard",
    createdAt: iso(0),
  },
  // Released order with reviews: buyer persona <-> seller persona, prior job.
  {
    id: "order_done",
    buyerId: BUYER_USER_ID,
    sellerId: SELLER_USER_ID,
    title: "Scale — Whop community setup",
    amount: 750,
    platformFee: 75,
    status: "released",
    source: "gig",
    serviceId: "svc_avery_community",
    packageTier: "premium",
    createdAt: iso(45),
  },
  // Another released order for the seller persona's dashboard revenue trend.
  {
    id: "order_done2",
    buyerId: "u_kofi",
    sellerId: SELLER_USER_ID,
    title: "Growth — Whop community setup",
    amount: 350,
    platformFee: 35,
    status: "released",
    source: "gig",
    serviceId: "svc_avery_community",
    packageTier: "standard",
    createdAt: iso(20),
  },
];

export const reviews: Review[] = [
  {
    id: "rev_done_seller",
    orderId: "order_done",
    authorId: BUYER_USER_ID,
    targetId: SELLER_USER_ID,
    rating: 5,
    comment:
      "Avery set up our entire community and automations flawlessly. Members are onboarding themselves now. Worth every dollar.",
    direction: "of_seller",
    createdAt: iso(40),
  },
  {
    id: "rev_done_buyer",
    orderId: "order_done",
    authorId: SELLER_USER_ID,
    targetId: BUYER_USER_ID,
    rating: 5,
    comment: "Clear brief and fast feedback. A pleasure to work with.",
    direction: "of_buyer",
    createdAt: iso(39),
  },
  {
    id: "rev_done2_seller",
    orderId: "order_done2",
    authorId: "u_kofi",
    targetId: SELLER_USER_ID,
    rating: 4,
    comment: "Solid setup and quick turnaround. Would hire again.",
    direction: "of_seller",
    createdAt: iso(18),
  },
];

export const messages: Message[] = [
  {
    id: "msg_1",
    orderId: "order_course",
    senderId: BUYER_USER_ID,
    body: "Hey Maya! Excited to get started. I'll send over my outline notes today.",
    createdAt: iso(6),
  },
  {
    id: "msg_2",
    orderId: "order_course",
    senderId: "u_maya",
    body: "Perfect — got them. I'll have the first two lessons ready for review by Friday.",
    createdAt: iso(5),
  },
];

export interface SeedSnapshot {
  users: User[];
  categories: Category[];
  services: Service[];
  tasks: Task[];
  offers: Offer[];
  orders: Order[];
  reviews: Review[];
  messages: Message[];
}

export const seed: SeedSnapshot = {
  users,
  categories,
  services,
  tasks,
  offers,
  orders,
  reviews,
  messages,
};
