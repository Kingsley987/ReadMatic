import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';
import { FileSystemAnalyzer } from './FileSystemAnalyzer.js';

/**
 * Feature: readme-generator, Property 2: Output location consistency
 * Validates: Requirements 1.3
 * 
 * Feature: readme-generator, Property 6: Tree formatting validity
 * Validates: Requirements 2.4
 * 
 * Feature: readme-generator, Property 3: Language detection consistency
 * Validates: Requirements 2.1
 * 
 * Feature: readme-generator, Property 4: Manifest parsing completeness
 * Validates: Requirements 2.2
 * 
 * Feature: readme-generator, Property 5: Directory classification consistency
 * Validates: Requirements 2.3
 * 
 * Feature: readme-generator, Property 1: README creation from directory structure
 * Validates: Requirements 1.1
 */
describe('FileSystemAnalyzer - Property Tests', () => {
  const analyzer = new FileSystemAnalyzer();
  const testDir = path.join(process.cwd(), 'test-temp');

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

  it('Property 2: Output location consistency - scanned structure root matches input path', () => {
    const validFileNameArb = fc.stringMatching(/^[a-zA-Z0-9_-]+\.(txt|js|ts|md)$/);
    
    fc.assert(
      fc.property(
        fc.array(validFileNameArb, { minLength: 1, maxLength: 5 }),
        (fileNames) => {
          const uniqueNames = [...new Set(fileNames)];
          if (uniqueNames.length === 0) return true;

          const testPath = path.join(testDir, `test-${Date.now()}-${Math.random()}`);
          fs.mkdirSync(testPath, { recursive: true });

          for (const fileName of uniqueNames) {
            fs.writeFileSync(path.join(testPath, fileName), 'test content');
          }

          const result = analyzer.scanDirectoryStructure(testPath);

          expect(result.path).toBe(testPath);
          expect(result.type).toBe('directory');

          fs.rmSync(testPath, { recursive: true, force: true });
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 6: Tree formatting validity - directory tree has valid hierarchical structure', () => {
    const validFileNameArb = fc.stringMatching(/^[a-zA-Z0-9_-]+\.(txt|js|ts|md)$/);
    const validDirNameArb = fc.stringMatching(/^[a-zA-Z0-9_-]+$/);
    
    fc.assert(
      fc.property(
        fc.array(validFileNameArb, { minLength: 0, maxLength: 3 }),
        fc.array(validDirNameArb, { minLength: 0, maxLength: 2 }),
        (fileNames, dirNames) => {
          const testPath = path.join(testDir, `test-${Date.now()}-${Math.random()}`);
          fs.mkdirSync(testPath, { recursive: true });

          const uniqueFiles = [...new Set(fileNames)];
          const uniqueDirs = [...new Set(dirNames)];

          for (const fileName of uniqueFiles) {
            fs.writeFileSync(path.join(testPath, fileName), 'test content');
          }

          for (const dirName of uniqueDirs) {
            fs.mkdirSync(path.join(testPath, dirName), { recursive: true });
          }

          const result = analyzer.scanDirectoryStructure(testPath);

          // Verify hierarchical structure properties
          expect(result.type).toBe('directory');
          expect(Array.isArray(result.children)).toBe(true);
          
          // All children should have valid types
          for (const child of result.children) {
            expect(['file', 'directory'].includes(child.type)).toBe(true);
            expect(child.path).toBeTruthy();
            expect(child.name).toBeTruthy();
          }

          // Files should have no children
          const fileChildren = result.children.filter(c => c.type === 'file');
          for (const file of fileChildren) {
            expect(file.children.length).toBe(0);
          }

          fs.rmSync(testPath, { recursive: true, force: true });
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3: Language detection consistency - same file set produces same language', () => {
    const extensionArb = fc.constantFrom('.ts', '.js', '.py', '.rs', '.go', '.java');
    
    fc.assert(
      fc.property(
        fc.array(extensionArb, { minLength: 1, maxLength: 20 }),
        (extensions) => {
          const files = extensions.map((ext, i) => `file${i}${ext}`);
          
          const result1 = analyzer.detectLanguage(files);
          const result2 = analyzer.detectLanguage(files);
          
          // Same input should produce same output
          expect(result1).toBe(result2);
          
          // Result should be a non-empty string
          expect(result1.length).toBeGreaterThan(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: Manifest parsing completeness - extracts name and description from valid manifests', () => {
    const validNameArb = fc.stringMatching(/^[a-z][a-z0-9-]{2,20}$/);
    const validDescArb = fc.string({ minLength: 5, maxLength: 100 });
    
    fc.assert(
      fc.property(
        validNameArb,
        validDescArb,
        (name, description) => {
          const testPath = path.join(testDir, `test-${Date.now()}-${Math.random()}`);
          fs.mkdirSync(testPath, { recursive: true });

          const packageJson = {
            name,
            description,
            version: '1.0.0',
            dependencies: { 'test-dep': '1.0.0' }
          };

          fs.writeFileSync(
            path.join(testPath, 'package.json'),
            JSON.stringify(packageJson, null, 2)
          );

          const manifests = analyzer.findDependencyManifests(testPath);

          expect(manifests.length).toBeGreaterThan(0);
          const npmManifest = manifests.find(m => m.type === 'npm');
          expect(npmManifest).toBeDefined();
          expect(npmManifest!.projectName).toBe(name);
          expect(npmManifest!.description).toBe(description);

          fs.rmSync(testPath, { recursive: true, force: true });
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 5: Directory classification consistency - known patterns are classified correctly', () => {
    const sourceNames = ['src', 'lib', 'source', 'app'];
    const testNames = ['test', 'tests', '__tests__', 'spec', 'specs'];
    const configNames = ['config', 'configuration'];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...sourceNames),
        fc.constantFrom(...testNames),
        fc.constantFrom(...configNames),
        (sourceName, testName, configName) => {
          const testPath = path.join(testDir, `test-${Date.now()}-${Math.random()}`);
          fs.mkdirSync(testPath, { recursive: true });

          fs.mkdirSync(path.join(testPath, sourceName), { recursive: true });
          fs.mkdirSync(path.join(testPath, testName), { recursive: true });
          fs.mkdirSync(path.join(testPath, configName), { recursive: true });

          const structure = analyzer.scanDirectoryStructure(testPath);
          const classified = analyzer.classifyDirectories(structure);

          expect(classified.source.length).toBeGreaterThan(0);
          expect(classified.test.length).toBeGreaterThan(0);
          expect(classified.config.length).toBeGreaterThan(0);

          fs.rmSync(testPath, { recursive: true, force: true });
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: README creation from directory structure - analyzeProject returns complete metadata', () => {
    const validNameArb = fc.stringMatching(/^[a-z][a-z0-9-]{2,20}$/);
    const validFileNameArb = fc.stringMatching(/^[a-zA-Z0-9_-]+\.(txt|js|ts|md)$/);
    
    fc.assert(
      fc.property(
        validNameArb,
        fc.array(validFileNameArb, { minLength: 1, maxLength: 5 }),
        (projectName, fileNames) => {
          const testPath = path.join(testDir, `test-${Date.now()}-${Math.random()}`);
          fs.mkdirSync(testPath, { recursive: true });

          const packageJson = {
            name: projectName,
            description: 'Test project',
            version: '1.0.0'
          };

          fs.writeFileSync(
            path.join(testPath, 'package.json'),
            JSON.stringify(packageJson, null, 2)
          );

          const uniqueFiles = [...new Set(fileNames)];
          for (const fileName of uniqueFiles) {
            fs.writeFileSync(path.join(testPath, fileName), 'test content');
          }

          const metadata = analyzer.analyzeProject(testPath);

          expect(metadata.name).toBe(projectName);
          expect(metadata.description).toBe('Test project');
          expect(metadata.language).toBeTruthy();
          expect(metadata.structure).toBeDefined();
          expect(metadata.structure.type).toBe('directory');
          expect(metadata.dependencies.length).toBeGreaterThan(0);

          fs.rmSync(testPath, { recursive: true, force: true });
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
