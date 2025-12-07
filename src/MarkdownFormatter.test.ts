import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { MarkdownFormatter } from './MarkdownFormatter.js';

/**
 * Feature: readme-generator, Property 14: Markdown syntax compliance
 * Validates: Requirements 5.3, 5.4
 * 
 * Feature: readme-generator, Property 12: Section ordering invariant
 * Validates: Requirements 5.1
 */
describe('MarkdownFormatter - Property Tests', () => {
  const formatter = new MarkdownFormatter();

  it('Property 14: Markdown syntax compliance - headers and code blocks use proper syntax', () => {
    const textArb = fc.string({ minLength: 1, maxLength: 50 });
    const levelArb = fc.integer({ min: 1, max: 6 });
    const codeArb = fc.string({ minLength: 1, maxLength: 100 });
    const langArb = fc.constantFrom('javascript', 'python', 'typescript', 'bash', '');
    
    fc.assert(
      fc.property(
        textArb,
        levelArb,
        codeArb,
        langArb,
        (text, level, code, lang) => {
          const heading = formatter.formatHeading(text, level);
          const codeBlock = formatter.formatCodeBlock(code, lang);

          // Headers should start with # symbols
          expect(heading).toMatch(/^#{1,6} /);
          const leadingHashes = heading.match(/^#+/)?.[0].length || 0;
          expect(leadingHashes).toBe(level);

          // Code blocks should use triple backticks
          expect(codeBlock).toMatch(/^```/);
          expect(codeBlock).toMatch(/```\n$/);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 12: Section ordering invariant - sections appear in specified order', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (t, d, i, u, s, l) => {
          // Use unique markers to avoid substring issues
          const sections = {
            title: `TITLE_${t}`,
            description: `DESC_${d}`,
            installation: `INSTALL_${i}`,
            usage: `USAGE_${u}`,
            structure: `STRUCT_${s}`,
            license: `LICENSE_${l}`
          };

          const result = formatter.assembleSections(sections);

          // Verify order by checking positions
          const order = ['title', 'description', 'installation', 'usage', 'structure', 'license'];
          let lastIndex = -1;
          
          for (const key of order) {
            const index = result.indexOf(sections[key]);
            if (index !== -1) {
              expect(index).toBeGreaterThanOrEqual(lastIndex);
              lastIndex = index + sections[key].length;
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
