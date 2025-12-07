import { DirectoryNode } from './types/index.js';

export class MarkdownFormatter {
  formatHeading(text: string, level: number): string {
    const hashes = '#'.repeat(level);
    return `${hashes} ${text}\n`;
  }

  formatCodeBlock(code: string, language: string = ''): string {
    return `\`\`\`${language}\n${code}\n\`\`\`\n`;
  }

  formatList(items: string[]): string {
    return items.map(item => `- ${item}`).join('\n') + '\n';
  }

  formatTree(node: DirectoryNode, indent: number = 0): string {
    const prefix = '  '.repeat(indent);
    let result = '';

    if (indent > 0) {
      result += prefix + node.name;
      if (node.type === 'directory') {
        result += '/';
      }
      result += '\n';
    }

    if (node.type === 'directory') {
      for (const child of node.children) {
        result += this.formatTree(child, indent + 1);
      }
    }

    return result;
  }

  assembleSections(sections: { [key: string]: string }): string {
    const order = ['title', 'description', 'installation', 'usage', 'structure', 'license'];
    let result = '';

    for (const key of order) {
      if (sections[key]) {
        result += sections[key];
      }
    }

    return result.trim() + '\n';
  }
}
