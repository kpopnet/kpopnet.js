export interface Values {
  x: string;
  y: string;
  graph: string;
  size: string;
  symbol: string;
  color: string;
}

export const GEN_FIELD = "(generation)";
export const LIFESPAN_FIELD = "(lifespan)";
export const AGE_FIELD = "(age)";
export const DEBUT_AGE_FIELD = "(debut_age)";

export const DEFAULT_GRAPH = "dot"; // FIXME: default = auto?
export const DEFAULT_COLOR = GEN_FIELD;

// default plot settings which make sense
const DEFAULT_VALUES: Values = {
  x: "",
  y: "",
  graph: DEFAULT_GRAPH,
  size: "",
  symbol: "",
  color: DEFAULT_COLOR,
};

// default fields for each plot type
// TODO: should we update all fields instead?
export const IDOL_VALUES = {
  x: "weight",
  y: "height",
};
export const GROUP_VALUES = {
  x: "debut_date",
  y: "members",
};

const DEFAULT_IDOL_VALUES: Values = {
  ...DEFAULT_VALUES,
  ...IDOL_VALUES,
};
const DEFAULT_GROUP_VALUES: Values = {
  ...DEFAULT_VALUES,
  ...GROUP_VALUES,
};

// Not very robust because user can use complex query which returns idols.
// But because we use it only to get default plot field values it's fine until
// same function is used for both serialization and deserialization
export function isGroupQuery(q: string) {
  return q.trim().startsWith(".groups");
}

export function getDefaultValues(q: string): Values {
  return structuredClone(
    isGroupQuery(q) ? DEFAULT_GROUP_VALUES : DEFAULT_IDOL_VALUES
  );
}

export function serializeFields(q: string, values: Values | null): string {
  if (!values) return "";
  const defValues = getDefaultValues(q);
  const parts: string[] = [];
  for (const [k, v] of Object.entries(values)) {
    if (v !== defValues[k as keyof Values]) {
      parts.push(`${k}:${v}`);
    }
  }
  return parts.join(" ");
}

export function deserializeFields(q: string, f: string): Values {
  const values = getDefaultValues(q);
  for (const part of f.trim().split(/\s+/)) {
    if (!part.includes(":")) continue;
    const [k, v] = part.split(":");
    if (!/^[\w()]+$/.test(v)) continue; // sanity check
    if (Object.hasOwn(values, k)) {
      // We can't know whether such field actually exists in the output for the
      // given query but not a big deal.
      values[k as keyof Values] = v;
    }
  }
  return values;
}

export const exportedForTesting = {
  DEFAULT_IDOL_VALUES,
  DEFAULT_GROUP_VALUES,
};
