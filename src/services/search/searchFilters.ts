import type { SearchFilters } from "../../types/search.types";

export type { SearchFilters } from "../../types/search.types";

const MAX_FILTER_TEXT_LENGTH = 120;

const normalizeTextFilter = (
  value: unknown,
  field: string,
): string | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw Object.assign(new Error(`${field} must be a string.`), {
      status: 400,
    });
  }

  const normalized = value.trim();
  if (normalized.length > MAX_FILTER_TEXT_LENGTH) {
    throw Object.assign(
      new Error(
        `${field} must be no longer than ${MAX_FILTER_TEXT_LENGTH} characters.`,
      ),
      { status: 400 },
    );
  }

  return normalized || undefined;
};

const normalizeExperience = (
  value: unknown,
  field: string,
): number | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const normalized =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.trim())
        : Number.NaN;
  if (!Number.isFinite(normalized) || normalized < 0 || normalized > 80) {
    throw Object.assign(
      new Error(`${field} must be a number between 0 and 80.`),
      { status: 400 },
    );
  }

  return normalized;
};

const normalizeSkills = (value: unknown): string[] | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const skills = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : null;

  if (
    !skills ||
    skills.length > 20 ||
    skills.some((skill) => typeof skill !== "string")
  ) {
    throw Object.assign(
      new Error(
        "skills must be a comma-separated string or an array of up to 20 strings.",
      ),
      { status: 400 },
    );
  }

  const normalized = Array.from(
    new Set(
      skills
        .map((skill) => (skill as string).trim())
        .filter(Boolean)
        .map((skill) => {
          if (skill.length > MAX_FILTER_TEXT_LENGTH) {
            throw Object.assign(
              new Error(
                `Each skill filter must be no longer than ${MAX_FILTER_TEXT_LENGTH} characters.`,
              ),
              { status: 400 },
            );
          }
          return skill;
        }),
    ),
  );

  return normalized.length > 0 ? normalized : undefined;
};

export function normalizeSearchFilters(value: unknown): SearchFilters {
  if (value === undefined || value === null) {
    return {};
  }
  if (typeof value !== "object" || Array.isArray(value)) {
    throw Object.assign(new Error("filters must be an object."), {
      status: 400,
    });
  }

  const filters = value as Record<string, unknown>;
  const supportedFields = new Set([
    "skills",
    "minYearsExperience",
    "maxYearsExperience",
    "location",
    "title",
    "education",
  ]);
  const unsupportedField = Object.keys(filters).find(
    (field) => !supportedFields.has(field),
  );
  if (unsupportedField) {
    throw Object.assign(
      new Error(`Unsupported search filter: ${unsupportedField}.`),
      { status: 400 },
    );
  }

  const minYearsExperience = normalizeExperience(
    filters.minYearsExperience,
    "minYearsExperience",
  );
  const maxYearsExperience = normalizeExperience(
    filters.maxYearsExperience,
    "maxYearsExperience",
  );
  if (
    minYearsExperience !== undefined &&
    maxYearsExperience !== undefined &&
    minYearsExperience > maxYearsExperience
  ) {
    throw Object.assign(
      new Error("minYearsExperience must not exceed maxYearsExperience."),
      { status: 400 },
    );
  }

  return {
    skills: normalizeSkills(filters.skills),
    minYearsExperience,
    maxYearsExperience,
    location: normalizeTextFilter(filters.location, "location"),
    title: normalizeTextFilter(filters.title, "title"),
    education: normalizeTextFilter(filters.education, "education"),
  };
}
