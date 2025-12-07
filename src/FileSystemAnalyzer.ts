import * as fs from 'fs';
import * as path from 'path';
import { DirectoryNode, DependencyManifest, ProjectMetadata } from './types/index.js';

export class FileSystemAnalyzer {
  scanDirectoryStructure(rootPath: string, maxDepth: number = 3, currentDepth: number = 0): DirectoryNode {
    const stats = fs.statSync(rootPath);
    const name = path.basename(rootPath);

    if (stats.isFile()) {
      return {
        name,
        type: 'file',
        children: [],
        path: rootPath
      };
    }

    const node: DirectoryNode = {
      name,
      type: 'directory',
      children: [],
      path: rootPath
    };

    if (currentDepth >= maxDepth) {
      return node;
    }

    try {
      const entries = fs.readdirSync(rootPath);
      
      for (const entry of entries) {
        if (entry.startsWith('.') && entry !== '.gitignore') continue;
        if (entry === 'node_modules') continue;
        if (entry === 'dist') continue;

        const fullPath = path.join(rootPath, entry);
        try {
          const childNode = this.scanDirectoryStructure(fullPath, maxDepth, currentDepth + 1);
          node.children.push(childNode);
        } catch (err) {
          // Skip inaccessible files/directories
        }
      }
    } catch (err) {
      // Directory not readable
    }

    return node;
  }

  detectLanguage(files: string[]): string {
    const extensionCounts: Record<string, number> = {};
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ext) {
        extensionCounts[ext] = (extensionCounts[ext] || 0) + 1;
      }
    }

    const languageMap: Record<string, string> = {
      '.ts': 'TypeScript',
      '.js': 'JavaScript',
      '.py': 'Python',
      '.rs': 'Rust',
      '.go': 'Go',
      '.java': 'Java',
      '.cpp': 'C++',
      '.c': 'C',
      '.rb': 'Ruby',
      '.php': 'PHP'
    };

    let maxCount = 0;
    let primaryExt = '';

    for (const [ext, count] of Object.entries(extensionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        primaryExt = ext;
      }
    }

    return languageMap[primaryExt] || 'Unknown';
  }

  findDependencyManifests(rootPath: string): DependencyManifest[] {
    const manifests: DependencyManifest[] = [];

    const packageJsonPath = path.join(rootPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        manifests.push({
          type: 'npm',
          filePath: packageJsonPath,
          projectName: content.name || path.basename(rootPath),
          description: content.description || '',
          dependencies: Object.keys(content.dependencies || {})
        });
      } catch (err) {
        // Invalid JSON
      }
    }

    const requirementsPath = path.join(rootPath, 'requirements.txt');
    if (fs.existsSync(requirementsPath)) {
      try {
        const content = fs.readFileSync(requirementsPath, 'utf-8');
        const deps = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        manifests.push({
          type: 'pip',
          filePath: requirementsPath,
          projectName: path.basename(rootPath),
          description: '',
          dependencies: deps
        });
      } catch (err) {
        // Can't read file
      }
    }

    const cargoPath = path.join(rootPath, 'Cargo.toml');
    if (fs.existsSync(cargoPath)) {
      try {
        const content = fs.readFileSync(cargoPath, 'utf-8');
        const nameMatch = content.match(/name\s*=\s*"([^"]+)"/);
        const descMatch = content.match(/description\s*=\s*"([^"]+)"/);
        
        manifests.push({
          type: 'cargo',
          filePath: cargoPath,
          projectName: nameMatch ? nameMatch[1] : path.basename(rootPath),
          description: descMatch ? descMatch[1] : '',
          dependencies: []
        });
      } catch (err) {
        // Can't read file
      }
    }

    return manifests;
  }

  classifyDirectories(node: DirectoryNode): { source: string[], test: string[], config: string[] } {
    const result = { source: [] as string[], test: [] as string[], config: [] as string[] };

    const sourcePatterns = ['src', 'lib', 'source', 'app'];
    const testPatterns = ['test', 'tests', '__tests__', 'spec', 'specs'];
    const configPatterns = ['config', 'configuration', '.config'];

    const classify = (n: DirectoryNode) => {
      if (n.type === 'directory') {
        const lowerName = n.name.toLowerCase();
        
        if (sourcePatterns.includes(lowerName)) {
          result.source.push(n.path);
        } else if (testPatterns.includes(lowerName)) {
          result.test.push(n.path);
        } else if (configPatterns.includes(lowerName)) {
          result.config.push(n.path);
        }

        for (const child of n.children) {
          classify(child);
        }
      }
    };

    classify(node);
    return result;
  }

  private collectFiles(node: DirectoryNode): string[] {
    const files: string[] = [];
    
    if (node.type === 'file') {
      files.push(node.path);
    } else {
      for (const child of node.children) {
        files.push(...this.collectFiles(child));
      }
    }
    
    return files;
  }

  analyzeProject(rootPath: string): ProjectMetadata {
    const structure = this.scanDirectoryStructure(rootPath);
    const files = this.collectFiles(structure);
    const language = this.detectLanguage(files);
    const dependencies = this.findDependencyManifests(rootPath);

    const primaryManifest = dependencies[0];
    const name = primaryManifest?.projectName || path.basename(rootPath);
    const description = primaryManifest?.description || '';

    let scripts: Record<string, string> = {};
    const npmManifest = dependencies.find(d => d.type === 'npm');
    if (npmManifest) {
      try {
        const content = JSON.parse(fs.readFileSync(npmManifest.filePath, 'utf-8'));
        scripts = content.scripts || {};
      } catch (err) {
        // Ignore
      }
    }

    let entryPoint: string | null = null;
    if (npmManifest) {
      try {
        const content = JSON.parse(fs.readFileSync(npmManifest.filePath, 'utf-8'));
        entryPoint = content.main || content.bin || null;
      } catch (err) {
        // Ignore
      }
    }

    return {
      name,
      description,
      language,
      entryPoint,
      scripts,
      dependencies,
      structure
    };
  }
}
