import { ProjectMetadata, DependencyManifest, DirectoryNode } from './types/index.js';

export class ContentGenerator {
  generateTitle(metadata: ProjectMetadata): string {
    return `# ${metadata.name}`;
  }

  generateDescription(metadata: ProjectMetadata): string {
    if (!metadata.description) {
      return '';
    }
    return `\n${metadata.description}\n`;
  }

  generateInstallation(manifests: DependencyManifest[]): string {
    if (manifests.length === 0) {
      return '';
    }

    let content = '\n## Installation\n\n';

    for (const manifest of manifests) {
      if (manifest.type === 'npm') {
        content += '```bash\nnpm install\n```\n\n';
        content += 'or\n\n';
        content += '```bash\nyarn install\n```\n\n';
      } else if (manifest.type === 'pip') {
        content += '```bash\npip install -r requirements.txt\n```\n\n';
      } else if (manifest.type === 'cargo') {
        content += '```bash\ncargo build\n```\n\n';
      }
    }

    return content;
  }

  generateUsage(metadata: ProjectMetadata): string {
    let content = '\n## Usage\n\n';

    if (Object.keys(metadata.scripts).length > 0) {
      content += 'Available scripts:\n\n';
      for (const [name, command] of Object.entries(metadata.scripts)) {
        content += `- \`npm run ${name}\`: ${command}\n`;
      }
      content += '\n';
    }

    if (metadata.entryPoint) {
      content += `Run the application:\n\n`;
      content += '```bash\nnode ' + metadata.entryPoint + '\n```\n\n';
    }

    return content;
  }

  generateStructure(tree: DirectoryNode, maxDepth: number = 3): string {
    let content = '\n## Project Structure\n\n```\n';
    content += this.formatTree(tree, 0, maxDepth);
    content += '```\n\n';
    return content;
  }

  private formatTree(node: DirectoryNode, depth: number, maxDepth: number): string {
    if (depth > maxDepth) {
      return '';
    }

    const indent = '  '.repeat(depth);
    let result = '';

    if (depth > 0) {
      result += indent + node.name;
      if (node.type === 'directory') {
        result += '/';
      }
      result += '\n';
    }

    if (node.type === 'directory') {
      for (const child of node.children) {
        result += this.formatTree(child, depth + 1, maxDepth);
      }
    }

    return result;
  }
}
