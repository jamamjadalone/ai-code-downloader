// Enhanced code block detection with language detection
const CODE_SELECTORS = [
  'pre',
  'code',
  '.code',
  '.highlight',
  '[class*="language-"]',
  '[class*="lang-"]'
];

// Language detection map
const LANGUAGE_MAP = {
  'javascript': 'js',
  'js': 'js',
  'typescript': 'ts',
  'python': 'py',
  'java': 'java',
  'cpp': 'cpp',
  'c++': 'cpp',
  'html': 'html',
  'css': 'css',
  'php': 'php',
  'ruby': 'rb',
  'go': 'go',
  'rust': 'rs',
  'swift': 'swift',
  'kotlin': 'kt',
  'bash': 'sh',
  'shell': 'sh',
  'json': 'json',
  'xml': 'xml',
  'markdown': 'md',
  'yaml': 'yml'
};

function processCodeBlocks() {
  document.querySelectorAll(CODE_SELECTORS.join(',')).forEach(element => {
    if (!element.dataset.codeDownloadProcessed) {
      addDownloadButton(element);
      element.dataset.codeDownloadProcessed = 'true';
    }
  });
}

function addDownloadButton(element) {
  const button = document.createElement('button');
  button.className = 'code-download-btn';
  button.title = 'Download Code Snippet';
  button.innerHTML = '↓';
  
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    downloadCode(element);
  });

  element.style.position = 'relative';
  element.appendChild(button);
}

function downloadCode(element) {
  const text = getElementText(element);
  const language = detectLanguage(element) || detectLanguageFromContent(text);
  const extension = language ? `.${language}` : '.txt';
  const filename = generateFilename(extension);
  
  chrome.runtime.sendMessage({
    action: 'downloadCode',
    text: text,
    filename: filename
  });
}

function detectLanguage(element) {
  // Check element's classes
  const classList = element.className.split(/\s+/);
  
  for (const className of classList) {
    // Check for language-* or lang-* classes
    const langMatch = className.match(/(?:lang|language)-(\w+)/i);
    if (langMatch && LANGUAGE_MAP[langMatch[1].toLowerCase()]) {
      return LANGUAGE_MAP[langMatch[1].toLowerCase()];
    }
    
    // Check for exact matches
    if (LANGUAGE_MAP[className.toLowerCase()]) {
      return LANGUAGE_MAP[className.toLowerCase()];
    }
  }
  
  // Check parent elements
  let parent = element.parentElement;
  for (let i = 0; i < 3 && parent; i++) {
    const parentClasses = parent.className.split(/\s+/);
    for (const className of parentClasses) {
      const langMatch = className.match(/(?:lang|language)-(\w+)/i);
      if (langMatch && LANGUAGE_MAP[langMatch[1].toLowerCase()]) {
        return LANGUAGE_MAP[langMatch[1].toLowerCase()];
      }
    }
    parent = parent.parentElement;
  }
  
  return null;
}

function detectLanguageFromContent(text) {
  const firstLine = text.split('\n')[0].trim();
  
  // HTML/XML detection
  if (/^<\?xml/.test(firstLine)) return 'xml';
  if (/^<!DOCTYPE html|^<html/.test(firstLine)) return 'html';
  
  // Programming languages
  if (/^(import|export|function|class|const|let|var)\s/.test(firstLine)) return 'js';
  if (/^(def|class|import)\s/.test(firstLine)) return 'py';
  if (/^(package|import|class|public)\s/.test(firstLine)) return 'java';
  if (/^#include/.test(firstLine)) return 'cpp';
  if (/^<\?php/.test(firstLine)) return 'php';
  if (/^@import/.test(firstLine)) return 'css';
  
  return null;
}

function getElementText(element) {
  // Handle inner code elements
  if (element.tagName === 'PRE' && element.querySelector('code')) {
    return element.querySelector('code').innerText || 
           element.querySelector('code').textContent;
  }
  return element.innerText || element.textContent;
}

function generateFilename(extension) {
  const pageTitle = document.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50) || 'code';
  const hash = Math.random().toString(36).substring(2, 7);
  return `${pageTitle}_${hash}${extension}`;
}

// Initialize
processCodeBlocks();
new MutationObserver(processCodeBlocks).observe(document.body, {
  childList: true,
  subtree: true
});