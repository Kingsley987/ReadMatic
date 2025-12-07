#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { FileSystemAnalyzer } from './FileSystemAnalyzer.js';
import { ContentGenerator } from './ContentGenerator.js';
import { MarkdownFormatter } from './MarkdownFormatter.js';
import { ConfigurationLoader } from './ConfigurationLoader.js';

async function main() {
  try {
    const rootPath = process.argv[2] || process.cwd();
    
    if (!fs.existsSync(rootPath)) {
      console.error(`Error: Directory not found: ${rootPath}`);
      process.exit(1);
    }

    const readmePath = path.join(rootPath, 'README.md');
    if (fs.existsSync(readmePath)) {
      console.log('README.md already exists. Overwrite? (y/n)');
      // For now, just overwrite - in production would wait for user input
    }

    console.log('Analyzing project...');
    
    const analyzer = new FileSystemAnalyzer();
    const generator = new ContentGenerator();
    const formatter = new MarkdownFormatter();
    const configLoader = new ConfigurationLoader();

    const config = configLoader.loadConfig(rootPath);
    const metadata = analyzer.analyzeProject(rootPath);

    console.log(`Project: ${metadata.name}`);
    console.log(`Language: ${metadata.language}`);

    let sections: { [key: string]: string } = {
      title: generator.generateTitle(metadata),
      description: generator.generateDescription(metadata),
      installation: generator.generateInstallation(metadata.dependencies),
      usage: generator.generateUsage(metadata),
      structure: generator.generateStructure(metadata.structure, config.maxDepth),
      license: ''
    };

    sections = configLoader.applySectionExclusion(sections, config.excludeSections);
    sections = configLoader.applyCustomContent(sections, config.customContent);

    const readme = formatter.assembleSections(sections);

    fs.writeFileSync(readmePath, readme);
    console.log(`\n✓ README.md generated successfully at ${readmePath}`);
  } catch (error) {
    console.error('Error generating README:', error);
    process.exit(1);
  }
}

main();
