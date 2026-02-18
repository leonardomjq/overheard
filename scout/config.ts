export const SCOUT_CONFIG = {
  schedule: "0 */4 * * *", // every 4 hours
  feeds: [
    {
      id: "tech_devtools",
      label: "Dev Tools & Frameworks",
      targets: [
        "https://x.com/search?q=developer+tools+framework+-giveaway+-airdrop&f=live",
      ],
    },
    {
      id: "tech_infra",
      label: "Infrastructure & Cloud",
      targets: [
        "https://x.com/search?q=infrastructure+cloud+deployment+-giveaway&f=live",
      ],
    },
    {
      id: "tech_languages",
      label: "Programming Languages",
      targets: [
        "https://x.com/search?q=programming+language+rust+typescript+performance+-giveaway&f=live",
      ],
    },
  ],
  maxTweetsPerCapture: 500,
  scrollDepthPx: 5000,
  captureTimeoutMs: 120000,
} as const;
