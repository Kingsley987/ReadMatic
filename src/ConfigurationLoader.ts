import * as fs from 'fs';
import * as path from 'path';
import { GeneratorConfig } from './types/index.js';

export class ConfigurationLoader {
  loadConfig(rootPath: string): GeneratorConfig {
    const configPath = path.join(rootPath, '.readmerc.json');
    
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf-8');
        const userConfig = JSON.parse(content);
        return this.mergeWithDefaults(userConfig);
      } catch (err) {
        // Invalid config, use defaults
      }
    }
    
    return this.mergeWithDefaults({});
  }

  mergeWithDefaults(config: Partial<GeneratorConfig>): GeneratorConfig {
    return {
      excludeSections: config.excludeSections || [],
      customContent: config.customContent || {},
      maxDepth: config.maxDepth ?? 3,
      includeHiddenFiles: config.includeHiddenFiles ?? false
    };
  }

  applySectionExclusion(sections: { [key: string]: string }, excludeSections: string[]): { [key: string]: string } {
    const result: { [key: string]: string } = {};
    
    for (const [key, value] of Object.entries(sections)) {
      if (!excludeSections.includes(key)) {
        result[key] = value;
      }
    }
    
    return result;
  }

  applyCustomContent(sections: { [key: string]: string }, customContent: Record<string, string>): { [key: string]: string } {
    const result = { ...sections };
    
    for (const [key, value] of Object.entries(customContent)) {
      if (value) {
        result[key] = value;
      }
    }
    
    return result;
  }
}
