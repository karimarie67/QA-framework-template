/**
 * normalise.js
 *
 * Turns raw spreadsheet rows plus a confirmed column map into the shared
 * normalised case shape (see `interfaces.md` "Normalised case"). Pure: no
 * I/O, no knowledge of CSV vs XLSX.
 */

const SCALAR_FIELDS = [
  'client_id',
  'title',
  'objective',
  'preconditions',
  'section',
  'priority',
  'notes',
];
const ARRAY_FIELDS = ['steps', 'expected'];

/**
 * Split a steps/expected cell into individual items.
 *
 * A cell holding numbered lines (`1. Do this` / `2) Do that`, one per
 * physical line) is split into one item per number, with the number prefix
 * removed and each item trimmed; empty items are dropped. A cell with no
 * numbering is returned as a single-item array. `null`/empty input returns
 * `[]`.
 * @param {string|null} text
 * @returns {string[]}
 */
export function splitNumbered(text) {
  if (text === null || text === undefined) {
    return [];
  }
  const s = String(text);
  const marker = /^\s*\d+[.)]\s/m;
  if (!marker.test(s)) {
    const trimmed = s.trim();
    return trimmed === '' ? [] : [trimmed];
  }
  return s
    .split(marker)
    .map(item => item.trim())
    .filter(item => item !== '');
}

/**
 * Build a header-name -> column-index lookup, trimming header text and
 * ignoring empty (trailing) header columns. When a header name repeats, the
 * first occurrence wins.
 * @param {string[]} headerRow
 * @returns {Record<string, number>}
 */
function buildHeaderIndex(headerRow) {
  const index = {};
  (headerRow || []).forEach((header, i) => {
    const trimmed = (header ?? '').trim();
    if (trimmed !== '' && !(trimmed in index)) {
      index[trimmed] = i;
    }
  });
  return index;
}

/**
 * Read a single mapped cell from a row, trimmed, `null` when absent, unmapped,
 * or empty.
 * @param {string[]} row
 * @param {Record<string, number>} headerIndex
 * @param {string|null} headerName
 * @returns {string|null}
 */
function readCell(row, headerIndex, headerName) {
  if (!headerName) {
    return null;
  }
  const idx = headerIndex[headerName];
  if (idx === undefined) {
    return null;
  }
  const value = row[idx];
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * Normalise raw spreadsheet rows into the shared case shape.
 *
 * `rows[0]` is treated as the header row. A row whose mapped `client_id`
 * cell is empty but has any other non-empty *mapped* cell continues the
 * case above it: its mapped steps cell adds steps, and its mapped expected
 * cell adds expected results, independently of one another. A row with no
 * non-empty mapped cell at all is skipped. A continuation row before any
 * case has started is ignored.
 * @param {string[][]} rows
 * @param {object} columnMap - See `interfaces.md` "Column map".
 * @returns {object[]} NormalisedCase[]
 */
export function normalise(rows, columnMap) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }
  const headerIndex = buildHeaderIndex(rows[0]);
  const cases = [];
  let current = null;

  for (let r = 1; r < rows.length; r += 1) {
    const row = rows[r] || [];
    const cell = field => readCell(row, headerIndex, columnMap[field]);

    const anyMappedNonEmpty = [...SCALAR_FIELDS, ...ARRAY_FIELDS].some(
      field => cell(field) !== null,
    );
    if (!anyMappedNonEmpty) {
      continue; // Fully empty row (with respect to mapped columns): skipped.
    }

    const clientId = cell('client_id');
    if (clientId !== null) {
      const stepsCell = cell('steps');
      const expectedCell = cell('expected');
      current = {
        client_id: clientId,
        title: cell('title'),
        objective: cell('objective'),
        preconditions: cell('preconditions'),
        steps: stepsCell !== null ? splitNumbered(stepsCell) : [],
        expected: expectedCell !== null ? splitNumbered(expectedCell) : [],
        section: cell('section'),
        priority: cell('priority'),
        notes: cell('notes'),
        source_row: r + 1,
      };
      cases.push(current);
      continue;
    }

    if (!current) {
      continue; // A continuation row before any case has started is ignored.
    }
    const stepsCell = cell('steps');
    const expectedCell = cell('expected');
    if (stepsCell !== null) {
      current.steps.push(...splitNumbered(stepsCell));
    }
    if (expectedCell !== null) {
      current.expected.push(...splitNumbered(expectedCell));
    }
  }

  return cases;
}
