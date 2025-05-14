// public/js/markdownParser.js
document.addEventListener('DOMContentLoaded', function() {
  // Parse markdown content
  const contentElement = document.getElementById('reflection-body');
  
  if (contentElement) {
    const format = contentElement.getAttribute('data-format') || 'markdown';
    const content = contentElement.textContent.trim();
    
    if (format === 'markdown') {
      contentElement.innerHTML = parseMarkdown(content);
    } else if (format === 'html') {
      // Content is already HTML, no need to parse
      contentElement.innerHTML = content;
    } else {
      // Plain text, just add paragraph tags
      contentElement.innerHTML = `<p>${content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
    }
  }
});

// Simple markdown parser
function parseMarkdown(text) {
  // Replace headers
  text = text.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  text = text.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  text = text.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  text = text.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
  
  // Replace bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Replace italic
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Replace links
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Replace images
  text = text.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">');
  
  // Replace blockquotes
  text = text.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');
  
  // Replace code blocks
  text = text.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
  
  // Replace inline code
  text = text.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Replace lists
  text = text.replace(/^- (.*?)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*?<\/li>)\n(<li>)/g, '$1$2');
  text = text.replace(/(<li>.*?<\/li>)(?!\n<li>)/g, '<ul>$1</ul>');
  
  // Replace numbered lists
  text = text.replace(/^(\d+)\. (.*?)$/gm, '<li>$2</li>');
  text = text.replace(/(<li>.*?<\/li>)\n(<li>)/g, '$1$2');
  text = text.replace(/(<li>.*?<\/li>)(?!\n<li>)/g, '<ol>$1</ol>');
  
  // Replace paragraphs
  text = text.replace(/\n\n/g, '</p><p>');
  
  // Wrap in paragraph tags if not already wrapped
  if (!text.startsWith('<h1>') && !text.startsWith('<h2>') && !text.startsWith('<h3>') && 
      !text.startsWith('<h4>') && !text.startsWith('<ul>') && !text.startsWith('<ol>') && 
      !text.startsWith('<blockquote>') && !text.startsWith('<p>')) {
    text = `<p>${text}</p>`;
  }
  
  return text;
}