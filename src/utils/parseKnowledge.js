/**
 * Parses the knowledge.md file into structured modules
 * Each H2 (##) becomes a module, each H3 (###) becomes a section
 */
export function parseKnowledge(markdown) {
  const lines = markdown.split('\n');
  const modules = [];
  let currentModule = null;
  let currentSection = null;
  let contentBuffer = [];

  const flushSection = () => {
    if (currentSection && contentBuffer.length > 0) {
      currentSection.content = contentBuffer.join('\n').trim();
      contentBuffer = [];
    }
  };

  const flushModule = () => {
    flushSection();
    if (currentSection) {
      currentModule.sections.push(currentSection);
      currentSection = null;
    }
  };

  for (const line of lines) {
    // H1 - title only
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      continue;
    }

    // H2 - new module
    if (line.startsWith('## ')) {
      if (currentModule) {
        flushModule();
        modules.push(currentModule);
      }
      const title = line.replace('## ', '').trim();
      currentModule = {
        id: slugify(title),
        title,
        sections: [],
      };
      continue;
    }

    // H3 - new section
    if (line.startsWith('### ')) {
      if (currentModule) {
        flushSection();
        if (currentSection) {
          currentModule.sections.push(currentSection);
        }
        const title = line.replace('### ', '').trim();
        currentSection = {
          id: slugify(title),
          title,
          content: '',
        };
      }
      continue;
    }

    if (currentSection) {
      contentBuffer.push(line);
    }
  }

  // flush last
  if (currentModule) {
    flushModule();
    modules.push(currentModule);
  }

  return modules;
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
