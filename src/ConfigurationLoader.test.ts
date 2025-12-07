import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigurationLoader } from './ConfigurationLoader.js';

/**
 * Feature: readme-generator, Property 15: Configuration application
 * Validates: Requirements 6.1
 * 
 * Feature: readme-generator, Property 16: Section exclusion correctness
 * Validates: Requirements 6.2
 * 
 * Feature: readme-generator, Property 17: Custom content override
 * Validates: Requirements 6.3
 */
describe('ConfigurationLoader - Property Tests', () => {
  const loader = new ConfigurationLoader();
  const testDir = path.join(process.cwd(), 'test-config-temp');

  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('Property 15: Configuration application - all specified options are reflected', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('title', 'description', 'installation', 'usage'), { minLength: 0, maxLength: 3 }),
        fc.integer({ min: 1, max: 10 }),
        fc.boolean(),
        (excludeSections, maxDepth, includeHiddenFiles) => {
          const testPath = path.join(testDir, `test-${Date.now()}-${Math.random()}`);
          fs.mkdirSync(testPath, { recursive: true });

          const config = {
            excludeSections,
            maxDepth,
            includeHiddenFiles,
            customContent: {}
          };

          fs.writeFileSync(
            path.join(testPath, '.readmerc.json'),
            JSON.stringify(config, null, 2)
          );

          const loaded = loader.loadConfig(testPath);

          expect(loaded.excludeSections).toEqual(excludeSections);
          expect(loaded.maxDepth).toBe(maxDepth);
          expect(loaded.includeHiddenFiles).toBe(includeHiddenFiles);

          fs.rmSync(testPath, { recursive: true, force: true });
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 16: Section exclusion correctness - excluded sections do not appear', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('title', 'description', 'installation', 'usage', 'structure'), { minLength: 1, maxLength: 3 }),
        (excludeSections) => {
          const sections = {
            title: 'Title',
            description: 'Description',
            installation: 'Installation',
            usage: 'Usage',
            structure: 'Structure'
          };

          const result = loader.applySectionExclusion(sections, excludeSections);

          for (const excluded of excludeSections) {
            expect(result[excluded]).toBeUndefined();
          }

          for (const key of Object.keys(sections)) {
            if (!excludeSections.includes(key)) {
              expect(result[key]).toBe(sections[key]);
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 17: Custom content override - custom content replaces auto-generated', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        (customTitle, customDesc) => {
          const sections = {
            title: 'Original Title',
            description: 'Original Description',
            installation: 'Installation'
          };

          const customContent = {
            title: customTitle,
            description: customDesc
          };

          const result = loader.applyCustomContent(sections, customContent);

          expect(result.title).toBe(customTitle);
          expect(result.description).toBe(customDesc);
          expect(result.installation).toBe('Installation');

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
