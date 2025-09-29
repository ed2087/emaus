// public/js/cms/markdownToolbar.js
document.addEventListener('DOMContentLoaded', function() {
  const textarea = document.getElementById('body');
  const previewContainer = document.getElementById('preview-container');
  const previewContent = document.getElementById('preview-content');
  const toolbarButtons = document.querySelectorAll('.toolbar-btn');
  
  if (!textarea) return;
  
  // Toolbar button actions
  const actions = {
    bold: () => wrapSelection('**', '**'),
    italic: () => wrapSelection('*', '*'),
    heading: () => addHeading(),
    quote: () => addLinePrefix('> '),
    code: () => wrapSelection('`', '`'),
    link: () => insertLink(),
    image: () => insertImage(),
    preview: () => togglePreview()
  };
  
  // Add click handlers to toolbar buttons
  toolbarButtons.forEach(button => {
    const action = button.dataset.action;
    if (actions[action]) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        actions[action]();
        textarea.focus();
      });
    }
  });
  
  // Keyboard shortcuts
  textarea.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case 'b':
          e.preventDefault();
          actions.bold();
          break;
        case 'i':
          e.preventDefault();
          actions.italic();
          break;
        case 'k':
          e.preventDefault();
          actions.link();
          break;
      }
    }
  });
  
  // Helper functions
  function wrapSelection(startTag, endTag = startTag) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);
    
    let newText;
    if (selectedText) {
      // Wrap selected text
      newText = beforeText + startTag + selectedText + endTag + afterText;
      textarea.value = newText;
      textarea.setSelectionRange(start + startTag.length, end + startTag.length);
    } else {
      // Insert tags at cursor position
      const placeholder = startTag === '**' ? 'texto en negrita' : 
                         startTag === '*' ? 'texto en cursiva' :
                         startTag === '`' ? 'código' : 'texto';
      newText = beforeText + startTag + placeholder + endTag + afterText;
      textarea.value = newText;
      textarea.setSelectionRange(start + startTag.length, start + startTag.length + placeholder.length);
    }
  }
  
  function addHeading() {
    const start = textarea.selectionStart;
    const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = textarea.value.indexOf('\n', start);
    const actualLineEnd = lineEnd === -1 ? textarea.value.length : lineEnd;
    
    const currentLine = textarea.value.substring(lineStart, actualLineEnd);
    const beforeLine = textarea.value.substring(0, lineStart);
    const afterLine = textarea.value.substring(actualLineEnd);
    
    let newLine;
    if (currentLine.startsWith('# ')) {
      // Already H1, make it H2
      newLine = currentLine.replace(/^# /, '## ');
    } else if (currentLine.startsWith('## ')) {
      // Already H2, make it H3
      newLine = currentLine.replace(/^## /, '### ');
    } else if (currentLine.startsWith('### ')) {
      // Already H3, remove heading
      newLine = currentLine.replace(/^### /, '');
    } else {
      // Make it H1
      newLine = '# ' + currentLine;
    }
    
    textarea.value = beforeLine + newLine + afterLine;
    textarea.setSelectionRange(lineStart + newLine.length, lineStart + newLine.length);
  }
  
  function addLinePrefix(prefix) {
    const start = textarea.selectionStart;
    const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = textarea.value.indexOf('\n', start);
    const actualLineEnd = lineEnd === -1 ? textarea.value.length : lineEnd;
    
    const currentLine = textarea.value.substring(lineStart, actualLineEnd);
    const beforeLine = textarea.value.substring(0, lineStart);
    const afterLine = textarea.value.substring(actualLineEnd);
    
    let newLine;
    if (currentLine.startsWith(prefix)) {
      // Remove prefix
      newLine = currentLine.substring(prefix.length);
    } else {
      // Add prefix
      newLine = prefix + currentLine;
    }
    
    textarea.value = beforeLine + newLine + afterLine;
    textarea.setSelectionRange(lineStart + newLine.length, lineStart + newLine.length);
  }
  
  function insertLink() {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const linkText = selectedText || prompt('Texto del enlace:') || 'enlace';
    const linkUrl = prompt('URL del enlace:') || 'https://ejemplo.com';
    
    if (linkText && linkUrl) {
      const linkMarkdown = `[${linkText}](${linkUrl})`;
      const beforeText = textarea.value.substring(0, start);
      const afterText = textarea.value.substring(end);
      
      textarea.value = beforeText + linkMarkdown + afterText;
      textarea.setSelectionRange(start + linkMarkdown.length, start + linkMarkdown.length);
    }
  }
  
  function insertImage() {
    const altText = prompt('Texto alternativo de la imagen:') || 'imagen';
    const imageUrl = prompt('URL de la imagen:') || 'https://ejemplo.com/imagen.jpg';
    
    if (altText && imageUrl) {
      const imageMarkdown = `![${altText}](${imageUrl})`;
      const start = textarea.selectionStart;
      const beforeText = textarea.value.substring(0, start);
      const afterText = textarea.value.substring(start);
      
      textarea.value = beforeText + imageMarkdown + afterText;
      textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
    }
  }
  
  function togglePreview() {
    const previewButton = document.querySelector('[data-action="preview"]');
    
    if (previewContainer.style.display === 'none' || !previewContainer.style.display) {
      // Show preview
      const markdownText = textarea.value;
      previewContent.innerHTML = parseMarkdown(markdownText);
      previewContainer.style.display = 'block';
      previewButton.classList.add('active');
    } else {
      // Hide preview
      previewContainer.style.display = 'none';
      previewButton.classList.remove('active');
    }
  }
  
  // Close preview button
  const closePreviewBtn = document.querySelector('.close-preview');
  if (closePreviewBtn) {
    closePreviewBtn.addEventListener('click', function() {
      previewContainer.style.display = 'none';
      document.querySelector('[data-action="preview"]').classList.remove('active');
    });
  }
});

// Enhanced parseMarkdown function (same as your existing one but improved)
function parseMarkdown(text) {
  if (!text) return '';
  
  // Escape HTML first
  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Replace headers (must be first)
  text = text.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
  text = text.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  text = text.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  text = text.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  
  // Replace bold and italic
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Replace links (before images to avoid conflict)
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Replace images
  text = text.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;">');
  
  // Replace blockquotes
  text = text.replace(/^&gt; (.*?)$/gm, '<blockquote>$1</blockquote>');
  
  // Replace code blocks
  text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Replace inline code
  text = text.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Replace unordered lists
  text = text.replace(/^- (.*?)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*?<\/li>)\n(<li>)/gs, '$1$2');
  text = text.replace(/(<li>.*?<\/li>)(?!\n<li>)/gs, '<ul>$1</ul>');
  
  // Replace ordered lists
  text = text.replace(/^(\d+)\. (.*?)$/gm, '<li>$2</li>');
  text = text.replace(/(<li>.*?<\/li>)\n(<li>)/gs, '$1$2');
  text = text.replace(/(<li>.*?<\/li>)(?!\n<li>)/gs, '<ol>$1</ol>');
  
  // Replace line breaks and paragraphs
  text = text.replace(/\n\n/g, '</p><p>');
  text = text.replace(/\n/g, '<br>');
  
  // Wrap in paragraphs if not already wrapped in block elements
  if (!text.match(/^<(h[1-6]|ul|ol|blockquote|pre)/)) {
    text = '<p>' + text + '</p>';
  }
  
  // Clean up empty paragraphs
  text = text.replace(/<p><\/p>/g, '');
  text = text.replace(/<p><br><\/p>/g, '');
  
  return text;
}