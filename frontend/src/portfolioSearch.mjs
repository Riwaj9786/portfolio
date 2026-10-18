import Fuse from "fuse.js";

export function plainText(value = "") {
  return String(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
export function buildSearchDocuments(content) {
  const rows = (model) => content[model] || [];
  const documents = [];
  const skillNames = (ids = []) =>
    ids
      .map((id) => rows("skills.skill").find((s) => s.id === id)?.name)
      .filter(Boolean);
  const add = (id, title, kind, body, tags, url) =>
    documents.push({
      id,
      title,
      kind,
      body: plainText(body),
      tags: tags.filter(Boolean).join(" "),
      url,
    });
  for (const p of rows("projects.project").filter((p) => !p.is_archive)) {
    const category = rows("projects.projectcategory").find(
      (c) => c.id === p.category,
    )?.name;
    add(
      `project-${p.id}`,
      p.name,
      "Project",
      [p.description, p.distinct_features, p.client].filter(Boolean).join(" "),
      ["project", category, ...skillNames(p.skills)],
      `/projects/${p.slug}/`.replace(/\/$/, ""),
    );
  }
  for (const e of rows("experience.experience").filter(
    (e) => e.to_display !== false,
  )) {
    const period = `${e.start_date?.slice(0, e.date_precision === "year" ? 4 : 7) || ""} – ${e.end_date?.slice(0, e.date_precision === "year" ? 4 : 7) || "Present"}`;
    add(
      `experience-${e.id}`,
      `${e.title} · ${e.company}`,
      "Experience",
      [period, e.description, ...(e.achievements || [])]
        .filter(Boolean)
        .join(". "),
      [
        "experience",
        e.category || "professional",
        e.company,
        ...skillNames(e.skills),
      ],
      `/?journey=${e.category || "professional"}#journey-title`,
    );
  }
  for (const s of rows("skills.skill")) {
    const category =
      rows("skills.skillcategory").find((c) => c.id === s.category)?.name ||
      "Skills";
    const rating =
      s.level === null || s.level === undefined
        ? "Proficiency not rated."
        : `Self-assessed proficiency: ${s.level}/10.`;
    add(
      `skill-${s.id}`,
      s.name,
      "Skill",
      `${category}. ${rating}`,
      ["skills", category, s.name],
      `/?skillCategory=${encodeURIComponent(category)}#skills-title`,
    );
  }
  for (const b of rows("blogs.blog").filter((b) => !b.is_draft))
    add(
      `blog-${b.id}`,
      b.title,
      "Article",
      b.content,
      ["blog", "article", b.title],
      `/blogs/${b.slug}`,
    );
  for (const s of rows("services.service"))
    add(
      `service-${s.id}`,
      s.title,
      "Service",
      s.description || s.title,
      ["service", s.title],
      "/#services-title",
    );
  for (const p of rows("account.user")) {
    add(
      "profile",
      p.name,
      "About",
      [p.title, p.short_bio, p.description].filter(Boolean).join(" "),
      ["about", "profile", "background"],
      "/",
    );
    if (p.resume)
      add(
        "resume",
        "Resume",
        "About",
        "Find the resume link in the site navigation.",
        ["resume", "cv", "download"],
        "/",
      );
  }
  for (const c of rows("contact.contactinformation"))
    add(
      `contact-${c.id}`,
      "Get in touch",
      "Contact",
      [
        c.address,
        c.whatsapp ? `WhatsApp: ${c.whatsapp}.` : "",
        "Use the email and social links on the contact page.",
      ].join(" "),
      ["contact", "email", "whatsapp", "hire", "collaborate", "location"],
      "/connect",
    );
  for (const link of rows("account.medialinks")) {
    const platform =
      {
        fb: "Facebook",
        ig: "Instagram",
        be: "Behance",
        lkin: "LinkedIn",
        gh: "GitHub",
        x: "X",
      }[link.platform_name] || link.platform_name;
    add(
      `social-${link.id}`,
      platform,
      "Contact",
      `Find ${platform} in the portfolio’s social links.`,
      ["contact", "social", platform],
      "/connect",
    );
  }
  return documents;
}
const stopWords = new Set(
  "a an the i me my you your he his him riwaj what which who where when how can could would do does did is are was were be been have has had about show find tell please some all any with using used use built build work works projects project experience experiences skills skill articles article blogs blog roles role services service portfolio of on in at to for and or from this that know more".split(
    " ",
  ),
);
export function createPortfolioSearch(content) {
  const documents = buildSearchDocuments(content);
  const fuse = new Fuse(documents, {
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.38,
    minMatchCharLength: 2,
    keys: [
      { name: "title", weight: 0.5 },
      { name: "tags", weight: 0.35 },
      { name: "body", weight: 0.15 },
    ],
  });
  return function search(input) {
    const query = String(input).trim().slice(0, 240);
    if (!query) return { text: "What would you like to find?", results: [] };
    if (/^(hi|hello|hey|thanks|thank you)[!.\s]*$/i.test(query))
      return {
        text: "Hi! I can search this portfolio for projects, skills, experience, articles, and ways to get in touch. What would you like to explore?",
        results: [],
      };
    const kind = /\b(projects?|built|applications?)\b/i.test(query)
      ? "Project"
      : /\b(skills?|proficiency)\b/i.test(query)
        ? "Skill"
        : /\b(experience|roles?|journey)\b/i.test(query)
          ? "Experience"
          : /\b(blogs?|articles?)\b/i.test(query)
            ? "Article"
            : /\bservices?\b/i.test(query)
              ? "Service"
              : null;
    const terms = [
      ...new Set(
        query
          .toLowerCase()
          .replace(/[^\p{L}\p{N}+#.\s-]/gu, " ")
          .split(/\s+/)
          .filter((t) => t.length > 1 && !stopWords.has(t)),
      ),
    ].slice(0, 8);
    const matches = new Map();
    for (const term of terms) {
      for (const result of fuse.search(term)) {
        if (kind && result.item.kind !== kind) continue;
        const match = matches.get(result.item.id) || {
          item: result.item,
          hits: 0,
          score: 0,
        };
        match.hits++;
        match.score += result.score || 0;
        matches.set(result.item.id, match);
      }
    }
    let results = terms.length
      ? [...matches.values()]
          .filter((r) => r.hits >= Math.ceil(terms.length * 0.65))
          .sort((a, b) => b.hits - a.hits || a.score - b.score)
          .map((r) => r.item)
      : kind
        ? documents.filter((d) => d.kind === kind)
        : [];
    results = results.slice(0, 4).map((item) => {
      const text = item.body || item.tags;
      const position = Math.min(
        ...terms
          .map((term) => text.toLowerCase().indexOf(term))
          .filter((i) => i >= 0),
      );
      const start = Number.isFinite(position) ? Math.max(0, position - 45) : 0;
      return {
        ...item,
        snippet: `${start ? "…" : ""}${text.slice(start, start + 190)}${text.length > start + 190 ? "…" : ""}`,
      };
    });
    return {
      text: results.length
        ? `Here ${results.length === 1 ? "is a match" : "are some matches"} from the portfolio. Open a result to see the full details.`
        : "I couldn’t find a close match in this portfolio. Try a tool, organization, project name, or topic such as “Django”, “logo design”, or “leadership”.",
      results,
    };
  };
}
