const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const baseHeaders = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

type QueryResult<T> = { data: T | null; error: { message: string } | null };

function buildUrl(table: string, params?: Record<string, string>): string {
  const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return url.toString();
}

async function postgrest<T>(
  method: string,
  table: string,
  params?: Record<string, string>,
  body?: unknown
): Promise<QueryResult<T>> {
  try {
    const res = await fetch(buildUrl(table, params), {
      method,
      headers: baseHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const msg = await res.text();
      return { data: null, error: { message: msg } };
    }
    const text = await res.text();
    const data = text ? (JSON.parse(text) as T) : ([] as unknown as T);
    return { data, error: null };
  } catch (e) {
    return { data: null, error: { message: String(e) } };
  }
}

type EqBuilder<T> = {
  eq: (col: string, val: string) => Promise<QueryResult<T>>;
};

type OrderBuilder<T> = {
  order: (col: string, opts?: { ascending?: boolean }) => Promise<QueryResult<T[]>>;
};

type FromBuilder<T> = {
  select: (cols: string) => OrderBuilder<T>;
  insert: (row: Record<string, unknown>) => Promise<QueryResult<T[]>>;
  update: (patch: Record<string, unknown>) => EqBuilder<T>;
  delete: () => EqBuilder<T>;
};

export const supabase = {
  from<T = Record<string, unknown>>(table: string): FromBuilder<T> {
    return {
      select(cols: string): OrderBuilder<T> {
        return {
          order(col: string, opts: { ascending?: boolean } = {}) {
            const dir = opts.ascending === false ? 'desc' : 'asc';
            return postgrest<T[]>('GET', table, {
              select: cols,
              order: `${col}.${dir}`,
            });
          },
        };
      },
      insert(row: Record<string, unknown>) {
        return postgrest<T[]>('POST', table, undefined, row);
      },
      update(patch: Record<string, unknown>): EqBuilder<T> {
        return {
          eq(col: string, val: string) {
            return postgrest<T>('PATCH', table, { [col]: `eq.${val}` }, patch);
          },
        };
      },
      delete(): EqBuilder<T> {
        return {
          eq(col: string, val: string) {
            return postgrest<T>('DELETE', table, { [col]: `eq.${val}` });
          },
        };
      },
    };
  },
};
