# Design Document

## Overview

The README Generator is a command-line tool built with modern JavaScript/TypeScript that analyzes project directories and automatically generates professional README.md files. The system uses a modular architecture with separate components for file system analysis, content generation, and output formatting.

## Architecture

The system follows a pipeline architecture with three main stages:

1. **Analysis Stage**: Scans the project directory to extract metadata, identify patterns, and collect information
2. **Generation Stage**: Transforms collected data into structured README sections
3. **Output Stage**: Formats and writes the final README.md file

```
[File System] → [Analyzer] → [Generator] → [Formatter] → [README.md]
```

## Components and Interfaces

### FileSystemAnalyzer

Responsible for scanning the project directory and extracting relevant information.

**Interface:**
```typescript
interface FileSystemAnalyzer {
  analyzeProject(rootPath: string): ProjectMetadata;
  detectLanguage(files: string[]): string;
  findDependencyManifests(rootPath: string): DependencyManifest[];
  scanDirectoryStructure(rootPath: string): DirectoryNode;
}
```

### ContentGenerator

Transforms analyzed project data into README sections.

**Interface:**
```typescript
interface ContentGenerator {
  generateTitle(metadata: ProjectMetadata): string;
  generateDescription(metadata: ProjectMetadata): string;
  generateInstallation(manifests: DependencyManifest[]): string;
  generateUsage(metadata: ProjectMetadata): string;
  generateStructure(tree: DirectoryNode): string;
}
```

### MarkdownFormatter

Formats content into proper markdown syntax.

**Interface:**
```typescript
interface MarkdownFormatter {
  formatHeading(text: string, level: number): string;
  formatCodeBlock(code: string, language: string): string;
  formatList(items: string[]): string;
  formatTree(node: DirectoryNode, indent: number): string;
}
```

### ConfigurationLoader

Loads and validates user configuration options.

**Interface:**
```typescript
interface ConfigurationLoader {
  loadConfig(rootPath: string): GeneratorConfig;
  mergeWithDefaults(config: Partial<GeneratorConfig>): GeneratorConfig;
}
```

## Data Models

### ProjectMetadata
```typescript
interface ProjectMetadata {
  name: string;
  description: string;
  language: string;
  entryPoint: string | null;
  scripts: Record<string, string>;
  dependencies: DependencyManifest[];
  structure: DirectoryNode;
}
```

### DependencyManifest
```typescript
interface DependencyManifest {
  type: 'npm' | 'pip' | 'cargo' | 'other';
  filePath: string;
  projectName: string;
  description: string;
  dependencies: string[];
}
```

### DirectoryNode
```typescript
interface DirectoryNode {
  name: string;
  type: 'file' | 'directory';
  children: DirectoryNode[];
  path: string;
}
```

### GeneratorConfig
```typescript
interface GeneratorConfig {
  excludeSections: string[];
  customContent: Record<string, string>;
  maxDepth: number;
  includeHiddenFiles: boolean;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: README creation from directory structure
*For any* valid project directory, running the generator should create a README.md file containing content derived from that directory's structure.
**Validates: Requirements 1.1**

### Property 2: Output location consistency
*For any* project structure, the generated README.md file should be written to the project root directory.
**Validates: Requirements 1.3**

### Property 3: Language detection consistency
*For any* collection of files with extensions, the language detection should consistently identify the primary language based on file count and extension patterns.
**Validates: Requirements 2.1**

### Property 4: Manifest parsing completeness
*For any* valid dependency manifest file (package.json, requirements.txt, Cargo.toml), the parser should successfully extract the project name and description fields.
**Validates: Requirements 2.2**

### Property 5: Directory classification consistency
*For any* directory structure, the key folder identification (source, test, config) should produce consistent results for the same structure.
**Validates: Requirements 2.3**

### Property 6: Tree formatting validity
*For any* directory tree structure, the formatted output should be a valid hierarchical representation with proper indentation and structure.
**Validates: Requirements 2.4**

### Property 7: Installation command generation
*For any* detected dependency manifest type, the generated README should include the appropriate installation commands for that package manager.
**Validates: Requirements 3.1, 3.2, 3.3**

### Property 8: Multiple manifest handling
*For any* project containing multiple dependency manifests, the generated README should include installation instructions for all detected package managers.
**Validates: Requirements 3.4**

### Property 9: Script listing completeness
*For any* package.json file containing scripts, all script names should appear in the generated README's usage section.
**Validates: Requirements 4.1**

### Property 10: Entry point usage generation
*For any* project with an identifiable entry point, the generated README should include a usage command referencing that entry point.
**Validates: Requirements 4.2**

### Property 11: CLI pattern recognition
*For any* project matching CLI tool patterns (bin field, shebang, etc.), the generated README should include command-line usage examples.
**Validates: Requirements 4.3**

### Property 12: Section ordering invariant
*For any* generated README, the sections should appear in the specified order: Title, Description, Installation, Usage, Project Structure, License.
**Validates: Requirements 5.1**

### Property 13: Title derivation consistency
*For any* project, the generated title should be derived from the dependency manifest name field or, if absent, the directory name.
**Validates: Requirements 5.2**

### Property 14: Markdown syntax compliance
*For any* generated README, all headers should use markdown heading syntax and all code blocks should use markdown code fences with language tags.
**Validates: Requirements 5.3, 5.4**

### Property 15: Configuration application
*For any* valid configuration file, all specified options should be reflected in the generated README output.
**Validates: Requirements 6.1**

### Property 16: Section exclusion correctness
*For any* list of excluded sections in the configuration, those sections should not appear in the generated README.
**Validates: Requirements 6.2**

### Property 17: Custom content override
*For any* section with custom content specified in configuration, the generated README should contain the custom content instead of auto-generated content for that section.
**Validates: Requirements 6.3**

## Error Handling

The system should handle errors gracefully at each stage:

1. **File System Errors**
   - Missing or inaccessible directories: Log error and exit with clear message
   - Permission errors: Inform user of permission issues with specific paths
   - Invalid paths: Validate input paths before processing

2. **Parsing Errors**
   - Malformed dependency manifests: Skip invalid files and continue with valid ones
   - Invalid JSON/TOML: Log warning and use fallback values
   - Missing required fields: Use sensible defaults (e.g., directory name for project name)

3. **Configuration Errors**
   - Invalid configuration file: Log warning and use default configuration
   - Unknown configuration options: Ignore unknown options and log warning
   - Conflicting options: Use precedence rules (user config > defaults)

4. **Output Errors**
   - Existing README.md: Prompt user for confirmation before overwriting
   - Write permission errors: Exit with clear error message
   - Disk space issues: Handle write failures gracefully

## Testing Strategy

### Unit Testing

The system will use **Vitest** as the testing framework for unit tests. Unit tests will cover:

- Individual function behavior with specific examples
- Edge cases like empty directories, missing files, malformed manifests
- Error handling paths
- Configuration parsing and merging logic
- Markdown formatting functions with specific inputs

### Property-Based Testing

The system will use **fast-check** for property-based testing in JavaScript/TypeScript. Property-based tests will:

- Run a minimum of 100 iterations per property
- Use custom generators for project structures, file trees, and configurations
- Verify universal properties hold across all valid inputs
- Each property-based test will be tagged with a comment in this format: `**Feature: readme-generator, Property {number}: {property_text}**`
- Each correctness property will be implemented by a single property-based test

**Generator Strategy:**
- `arbitraryDirectoryTree()`: Generates random directory structures with files and folders
- `arbitraryDependencyManifest()`: Generates valid package.json, requirements.txt, or Cargo.toml content
- `arbitraryProjectMetadata()`: Generates complete project metadata objects
- `arbitraryConfig()`: Generates valid configuration objects with various options

### Integration Testing

- End-to-end tests that run the generator on real project structures
- Validation that generated READMEs are valid markdown
- Tests with various project types (Node.js, Python, Rust, mixed)

## Implementation Notes

1. **Language Detection**: Use file extension frequency analysis with weighted scoring for common patterns
2. **Directory Classification**: Use pattern matching on directory names (src, lib, test, spec, config, etc.)
3. **Entry Point Detection**: Check for main field in package.json, __main__.py, main.rs, index.js patterns
4. **CLI Detection**: Look for bin field in package.json, shebang lines in files, or CLI framework imports
5. **Tree Formatting**: Use recursive depth-first traversal with configurable max depth
6. **Configuration**: Support .readmerc.json or readme.config.js in project root
