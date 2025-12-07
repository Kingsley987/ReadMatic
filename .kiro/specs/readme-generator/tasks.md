# Implementation Plan

- [x] 1. Set up project structure and dependencies


  - Create package.json with TypeScript, Vitest, and fast-check dependencies
  - Set up TypeScript configuration for Node.js
  - Create basic directory structure: src/, src/types/, src/utils/
  - _Requirements: All_



- [ ] 2. Implement core data models and types
  - Define TypeScript interfaces for ProjectMetadata, DependencyManifest, DirectoryNode, GeneratorConfig

  - Create type definitions file


  - _Requirements: 1.1, 2.1, 2.2, 2.3_

- [x] 3. Implement FileSystemAnalyzer


- [ ] 3.1 Create file system scanning functionality
  - Implement scanDirectoryStructure to build DirectoryNode tree


  - Add logic to traverse directories recursively with max depth limit
  - _Requirements: 1.1, 2.3_


- [ ] 3.2 Write property test for directory scanning
  - **Property 2: Output location consistency**
  - **Validates: Requirements 1.3**



- [x] 3.3 Write property test for tree structure

  - **Property 6: Tree formatting validity**
  - **Validates: Requirements 2.4**

- [x] 3.4 Implement language detection


  - Create detectLanguage function that analyzes file extensions
  - Use frequency analysis with weighted scoring

  - _Requirements: 2.1_

- [ ] 3.5 Write property test for language detection
  - **Property 3: Language detection consistency**


  - **Validates: Requirements 2.1**


- [ ] 3.6 Implement dependency manifest detection
  - Create findDependencyManifests to locate package.json, requirements.txt, Cargo.toml
  - Parse manifest files and extract name, description, dependencies
  - _Requirements: 2.2, 3.1, 3.2, 3.3_




- [ ] 3.7 Write property test for manifest parsing
  - **Property 4: Manifest parsing completeness**


  - **Validates: Requirements 2.2**

- [x] 3.8 Implement directory classification


  - Create logic to identify source, test, and config directories
  - Use pattern matching on directory names

  - _Requirements: 2.3_

- [ ] 3.9 Write property test for directory classification
  - **Property 5: Directory classification consistency**


  - **Validates: Requirements 2.3**



- [ ] 3.10 Implement analyzeProject orchestration
  - Combine all analysis functions into single analyzeProject method

  - Return complete ProjectMetadata object
  - _Requirements: 1.1_

- [ ] 3.11 Write property test for README creation
  - **Property 1: README creation from directory structure**


  - **Validates: Requirements 1.1**



- [x] 4. Implement ContentGenerator

- [ ] 4.1 Create title and description generation


  - Implement generateTitle using manifest name or directory name
  - Implement generateDescription from manifest description field

  - _Requirements: 5.2_

- [x] 4.2 Write property test for title derivation

  - **Property 13: Title derivation consistency**
  - **Validates: Requirements 5.2**



- [ ] 4.3 Create installation section generation
  - Implement generateInstallation for npm, pip, cargo


  - Handle multiple package managers
  - _Requirements: 3.1, 3.2, 3.3, 3.4_


- [ ] 4.4 Write property test for installation commands
  - **Property 7: Installation command generation**
  - **Validates: Requirements 3.1, 3.2, 3.3**



- [ ] 4.5 Write property test for multiple manifests
  - **Property 8: Multiple manifest handling**
  - **Validates: Requirements 3.4**



- [ ] 4.6 Create usage section generation
  - Implement generateUsage with script listing


  - Add entry point detection and usage command generation
  - Add CLI pattern detection

  - _Requirements: 4.1, 4.2, 4.3_

- [x] 4.7 Write property test for script listing

  - **Property 9: Script listing completeness**
  - **Validates: Requirements 4.1**


- [ ] 4.8 Write property test for entry point usage
  - **Property 10: Entry point usage generation**
  - **Validates: Requirements 4.2**



- [ ] 4.9 Write property test for CLI pattern
  - **Property 11: CLI pattern recognition**
  - **Validates: Requirements 4.3**



- [ ] 4.10 Create structure section generation
  - Implement generateStructure to format directory tree
  - Use hierarchical tree representation

  - _Requirements: 2.4_

- [ ] 5. Implement MarkdownFormatter
- [ ] 5.1 Create markdown formatting utilities
  - Implement formatHeading, formatCodeBlock, formatList, formatTree
  - Ensure proper markdown syntax for all elements

  - _Requirements: 5.3, 5.4_

- [ ] 5.2 Write property test for markdown compliance
  - **Property 14: Markdown syntax compliance**




  - **Validates: Requirements 5.3, 5.4**

- [ ] 5.3 Implement section ordering
  - Create function to assemble sections in correct order
  - Ensure Title, Description, Installation, Usage, Project Structure, License order

  - _Requirements: 5.1_

- [ ] 5.4 Write property test for section ordering
  - **Property 12: Section ordering invariant**
  - **Validates: Requirements 5.1**

- [ ] 6. Implement ConfigurationLoader
- [ ] 6.1 Create configuration loading
  - Implement loadConfig to read .readmerc.json
  - Implement mergeWithDefaults for configuration merging
  - _Requirements: 6.1, 6.4_

- [ ] 6.2 Write property test for configuration application
  - **Property 15: Configuration application**
  - **Validates: Requirements 6.1**

- [ ] 6.3 Implement section exclusion logic
  - Add logic to filter out excluded sections
  - _Requirements: 6.2_

- [ ] 6.4 Write property test for section exclusion
  - **Property 16: Section exclusion correctness**
  - **Validates: Requirements 6.2**

- [ ] 6.5 Implement custom content override
  - Add logic to replace auto-generated content with custom content
  - _Requirements: 6.3_

- [ ] 6.6 Write property test for custom content
  - **Property 17: Custom content override**
  - **Validates: Requirements 6.3**

- [ ] 7. Implement main CLI interface
- [ ] 7.1 Create CLI entry point
  - Implement main function that orchestrates all components
  - Add command-line argument parsing
  - Handle existing README.md with user prompt
  - _Requirements: 1.1, 1.2_

- [ ] 7.2 Add error handling
  - Implement error handling for file system errors
  - Add error handling for parsing errors
  - Add error handling for configuration errors
  - Add error handling for output errors
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 7.3 Implement README output
  - Write generated content to README.md in project root
  - Handle write permissions and disk space issues
  - _Requirements: 1.3_

- [ ] 7.4 Write unit tests for edge cases
  - Test empty directory handling
  - Test existing README.md prompt
  - Test missing entry point fallback
  - Test no configuration file default behavior
  - _Requirements: 1.4, 4.4, 6.4_

- [ ] 8. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise
