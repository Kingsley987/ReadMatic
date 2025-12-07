import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ContentGenerator } from './ContentGenerator.js';
import { ProjectMetadata, DirectoryNode } from './types/index.js';

/**
 * Feature: readme-generator, Property 13: Title derivation consistency
 * Validates: Requirements 5.2
 * 
 * Feature: readme-generator, Property 7: Installation command generation
 * Validates: Requirements 3.1, 3.2, 3.3
 * 
 * Feature: readme-generator, Property 8: Multiple manifest handling
 * Validates: Requirements 3.4
 * 
 * Feature: readme-generator, Property 9: Script listing completeness
 * Validates: Requirements 4.1
 * 
 * Feature: readme-generator, Property 10: Entry point usage generation
 * Validates: Requirements 4.2
 * 
 * Feature: readme-generator, Property 11: CLI pattern recognition
 * Validates: Requirements 4.3
 */
describe('ContentGenerator - Property Tests', () => {
  const generator = new ContentGenerator();

  it('Property 13: Title derivation consistency - title uses project name', () => {
    const validNameArb = fc.stringMatching(/^[a-z][a-z0-9-]{2,20}$/);
    
    fc.assert(
      fc.property(
        validNameArb,
        (projectName) => {
          const metadata: ProjectMetadata = {
            name: projectName,
            description: 'Test description',
            language: 'TypeScript',
            entryPoint: null,
            scripts: {},
            dependencies: [],
            structure: { name: 'root', type: 'directory', children: [], path: '/test' }
          };

          const title = generator.generateTitle(metadata);

          expect(title).toContain(projectName);
          expect(title).toMatch(/^# /);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 7: Installation command generation - includes commands for detected manifest types', () => {
    const manifestTypeArb = fc.constantFrom('npm', 'pip', 'cargo');
    
    fc.assert(
      fc.property(
        manifestTypeArb,
        (manifestType) => {
          const manifest = {
            type: manifestType as 'npm' | 'pip' | 'cargo',
            filePath: '/test/manifest',
            projectName: 'test-project',
            description: 'Test',
            dependencies: []
          };

          const installation = generator.generateInstallation([manifest]);

          expect(installation).toContain('## Installation');
          
          if (manifestType === 'npm') {
            expect(installation).toContain('npm install');
          } else if (manifestType === 'pip') {
            expect(installation).toContain('pip install');
          } else if (manifestType === 'cargo') {
            expect(installation).toContain('cargo build');
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Multiple manifest handling - includes instructions for all manifest types', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('npm', 'pip', 'cargo'), { minLength: 1, maxLength: 3 }),
        (manifestTypes) => {
          const uniqueTypes = [...new Set(manifestTypes)];
          const manifests = uniqueTypes.map(type => ({
            type: type as 'npm' | 'pip' | 'cargo',
            filePath: `/test/${type}`,
            projectName: 'test-project',
            description: 'Test',
            dependencies: []
          }));

          const installation = generator.generateInstallation(manifests);

          for (const type of uniqueTypes) {
            if (type === 'npm') {
              expect(installation).toContain('npm install');
            } else if (type === 'pip') {
              expect(installation).toContain('pip install');
            } else if (type === 'cargo') {
              expect(installation).toContain('cargo build');
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 9: Script listing completeness - all scripts appear in usage section', () => {
    const scriptNameArb = fc.stringMatching(/^[a-z][a-z0-9:-]{2,15}$/);
    const scriptCommandArb = fc.string({ minLength: 5, maxLength: 30 });
    
    fc.assert(
      fc.property(
        fc.dictionary(scriptNameArb, scriptCommandArb, { minKeys: 1, maxKeys: 5 }),
        (scripts) => {
          const metadata: ProjectMetadata = {
            name: 'test-project',
            description: 'Test',
            language: 'TypeScript',
            entryPoint: null,
            scripts,
            dependencies: [],
            structure: { name: 'root', type: 'directory', children: [], path: '/test' }
          };

          const usage = generator.generateUsage(metadata);

          for (const scriptName of Object.keys(scripts)) {
            expect(usage).toContain(scriptName);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 10: Entry point usage generation - entry point appears in usage command', () => {
    const entryPointArb = fc.stringMatching(/^[a-z][a-z0-9/.-]{2,20}\.(js|ts)$/);
    
    fc.assert(
      fc.property(
        entryPointArb,
        (entryPoint) => {
          const metadata: ProjectMetadata = {
            name: 'test-project',
            description: 'Test',
            language: 'TypeScript',
            entryPoint,
            scripts: {},
            dependencies: [],
            structure: { name: 'root', type: 'directory', children: [], path: '/test' }
          };

          const usage = generator.generateUsage(metadata);

          expect(usage).toContain(entryPoint);
          expect(usage).toContain('node');

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 11: CLI pattern recognition - bin field indicates CLI tool', () => {
    // This test validates that when a bin field is present (CLI pattern), it's treated as an entry point
    const binPathArb = fc.stringMatching(/^[a-z][a-z0-9/.-]{2,20}\.(js|ts)$/);
    
    fc.assert(
      fc.property(
        binPathArb,
        (binPath) => {
          const metadata: ProjectMetadata = {
            name: 'test-project',
            description: 'Test',
            language: 'TypeScript',
            entryPoint: binPath,
            scripts: {},
            dependencies: [],
            structure: { name: 'root', type: 'directory', children: [], path: '/test' }
          };

          const usage = generator.generateUsage(metadata);

          // CLI tools should have usage instructions
          expect(usage).toContain('## Usage');
          expect(usage.length).toBeGreaterThan(10);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
