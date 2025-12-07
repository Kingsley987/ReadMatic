import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { FileSystemAnalyzer } from './FileSystemAnalyzer.js';
import { ContentGenerator } from './ContentGenerator.js';
import { ConfigurationLoader } from './ConfigurationLoader.js';

describe('Edge Cases - Unit Tests', () => {
  const testDir = path.join(process.cwd(), 'test-edge-temp');

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

  it('handles empty directory gracefully', () => {
    const analyzer = new FileSystemAnalyzer();
    const metadata = analyzer.analyzeProject(testDir);

    expect(metadata.name).toBe(path.basename(testDir));
    expect(metadata.structure.type).toBe('directory');
    expect(metadata.structure.children.length).toBe(0);
  });

  it('handles missing entry point with fallback', () => {
    const generator = new ContentGenerator();
    const metadata = {
      name: 'test-project',
      description: 'Test',
      language: 'TypeScript',
      entryPoint: null,
      scripts: {},
      dependencies: [],
      structure: { name: 'root', type: 'directory' as const, children: [], path: '/test' }
    };

    const usage = generator.generateUsage(metadata);
    
    expect(usage).toContain('## Usage');
    // Should still generate a usage section even without entry point
  });

  it('uses default configuration when no config file exists', () => {
    const loader = new ConfigurationLoader();
    const config = loader.loadConfig(testDir);

    expect(config.excludeSections).toEqual([]);
    expect(config.customContent).toEqual({});
    expect(config.maxDepth).toBe(3);
    expect(config.includeHiddenFiles).toBe(false);
  });

  it('handles invalid JSON in config file gracefully', () => {
    const configPath = path.join(testDir, '.readmerc.json');
    fs.writeFileSync(configPath, '{ invalid json }');

    const loader = new ConfigurationLoader();
    const config = loader.loadConfig(testDir);

    // Should fall back to defaults
    expect(config.excludeSections).toEqual([]);
    expect(config.maxDepth).toBe(3);
  });

  it('generates minimal README for project with no manifest', () => {
    const analyzer = new FileSystemAnalyzer();
    const generator = new ContentGenerator();
    
    fs.writeFileSync(path.join(testDir, 'test.txt'), 'content');
    
    const metadata = analyzer.analyzeProject(testDir);
    const title = generator.generateTitle(metadata);
    const installation = generator.generateInstallation(metadata.dependencies);

    expect(title).toContain(path.basename(testDir));
    expect(installation).toBe(''); // No manifests, no installation section
  });
});
