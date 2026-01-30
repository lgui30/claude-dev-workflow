# Contributing

Thank you for your interest in contributing to claude-dev-workflow.

## Ways to Contribute

### Add a Skill

Skills are technology-specific knowledge base files in `.claude/skills/`. To add one:

1. Create a new file: `.claude/skills/{technology}-patterns.md`
2. Follow the skill structure:
   - Overview
   - File Structure
   - Code Patterns (with complete examples)
   - Common Pitfalls
   - Testing Notes
3. Update relevant agent files to reference the new skill
4. Submit a PR with a description of what the skill covers

### Improve an Agent

Agents define phase behavior in `.claude/agents/`. To improve one:

1. Test the agent by running `/implement Phase N` on a real feature
2. Identify patterns that produce poor output or miss edge cases
3. Update the agent's quality rules, output format, or process steps
4. Submit a PR with before/after examples

### Add a Command

Commands are slash command definitions in `.claude/commands/`. To add one:

1. Create a new file: `.claude/commands/{name}.md`
2. Follow the command structure: Arguments, Instructions (with steps), Output
3. Document it in `docs/command-reference.md`
4. Submit a PR

### Improve the Starter

The starter monorepo in `starter/` should work out of the box:

1. Fork the repo and clone it
2. Make changes in `starter/`
3. Verify: `npm install && npm run build && npm run test`
4. Submit a PR

## Development Setup

```bash
git clone https://github.com/your-org/claude-dev-workflow.git
cd claude-dev-workflow/starter
npm install
npm run build
npm run test
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure the starter builds and tests pass
4. Write a clear PR description explaining *what* and *why*
5. Link any related issues

## Code of Conduct

- Be respectful and constructive
- Focus on the work, not the person
- Welcome newcomers and help them contribute
- Assume good intentions

## Questions?

Open an issue on GitHub for questions or discussions.
