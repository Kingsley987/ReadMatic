export interface DirectoryNode {
  name: string;
  type: 'file' | 'directory';
  children: DirectoryNode[];
  path: string;
}

export interface DependencyManifest {
  type: 'npm' | 'pip' | 'cargo' | 'other';
  filePath: string;
  projectName: string;
  description: string;
  dependencies: string[];
}

export interface ProjectMetadata {
  name: string;
  description: string;
  language: string;
  entryPoint: string | null;
  scripts: Record<string, string>;
  dependencies: DependencyManifest[];
  structure: DirectoryNode;
}

export interface GeneratorConfig {
  excludeSections: string[];
  customContent: Record<string, string>;
  maxDepth: number;
  includeHiddenFiles: boolean;
}
