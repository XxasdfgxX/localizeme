export type TopicKey = "restaurants" | "malls" | "auto_dealers" | "other";

export type TopicMeta = {
  key: TopicKey;
  label: string;
  keyword: string;
};

export const TOPICS: TopicMeta[] = [
  {
    key: "restaurants",
    label: "Restaurants Near Me",
    keyword: "restaurants"
  },
  {
    key: "malls",
    label: "Malls Near Me",
    keyword: "shopping malls"
  },
  {
    key: "auto_dealers",
    label: "Auto Dealers Near Me",
    keyword: "car dealers"
  },
  {
    key: "other",
    label: "Other (Custom Topic)",
    keyword: "business"
  }
];

export const TOPIC_MAP = new Map(TOPICS.map((topic) => [topic.key, topic]));
const OTHER_PREFIX = "other:";

export function isTopicKey(value: string): value is TopicKey {
  return TOPIC_MAP.has(value as TopicKey);
}

export function sanitizeCustomTopic(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function encodeStoredTopic(topic: TopicKey, customTopic?: string) {
  if (topic !== "other") {
    return topic;
  }

  const cleanCustomTopic = sanitizeCustomTopic(customTopic ?? "");
  if (!cleanCustomTopic) {
    throw new Error("Custom topic is required when topic is Other.");
  }

  return `${OTHER_PREFIX}${cleanCustomTopic}`;
}

export function parseStoredTopic(storedTopic: string) {
  if (storedTopic.startsWith(OTHER_PREFIX)) {
    const customTopic = sanitizeCustomTopic(storedTopic.slice(OTHER_PREFIX.length));
    const fallbackTopic = "local businesses";
    const query = customTopic || fallbackTopic;

    return {
      key: "other" as TopicKey,
      label: customTopic ? `Other: ${customTopic}` : "Other",
      mapsQuery: query,
      customTopic: customTopic || null
    };
  }

  const known = TOPIC_MAP.get(storedTopic as TopicKey);
  if (known) {
    return {
      key: known.key,
      label: known.label,
      mapsQuery: known.keyword,
      customTopic: null
    };
  }

  return {
    key: "other" as TopicKey,
    label: storedTopic,
    mapsQuery: storedTopic,
    customTopic: storedTopic
  };
}
