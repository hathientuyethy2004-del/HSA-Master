
import React, { useEffect, useRef } from 'react';

interface MathContentProps {
  content: string;
  className?: string;
}

const MathContent: React.FC<MathContentProps> = ({ content, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && (window as any).renderMathInElement) {
      (window as any).renderMathInElement(containerRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
        ],
        throwOnError: false,
      });
    }
  }, [content]);

  // Hàm cơ bản để render Markdown Table sang HTML Table (nếu có)
  const formatMarkdownTable = (text: string) => {
    const lines = text.split('\n');
    let isInTable = false;
    let tableHtml = '<div class="overflow-x-auto my-6"><table class="min-w-full border-collapse border border-gray-200 text-sm">';
    
    const result = lines.map(line => {
      if (line.trim().startsWith('|') && line.includes('|')) {
        const cells = line.split('|').filter(c => c.trim() !== '' || line.startsWith('|') && line.endsWith('|'));
        if (line.includes('---')) return ''; // Bỏ qua dòng separator
        
        const rowContent = cells.map(cell => `<td class="border border-gray-300 p-2 text-center">${cell.trim()}</td>`).join('');
        return `<tr>${rowContent}</tr>`;
      }
      return line;
    });

    // Đây là logic đơn giản, trong thực tế có thể dùng thư viện marked
    // Nhưng để giữ app nhẹ, ta xử lý replace các khối có nhiều dấu |
    let processed = content
      .replace(/\|(.+)\|/g, (match) => {
        if (match.includes('---')) return '';
        const cells = match.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1);
        return `<tr class="border-b border-gray-200">${cells.map(c => `<td class="border border-gray-200 p-2 text-center">${c.trim()}</td>`).join('')}</tr>`;
      });
    
    // Bọc các tr vào table nếu có
    if (processed.includes('</tr>')) {
      processed = processed.replace(/(<tr(.+?)<\/tr>)+/g, (match) => `<div class="overflow-x-auto my-4"><table class="min-w-full border border-gray-300 bg-white/5 font-mono">${match}</table></div>`);
    }

    return processed.replace(/\n/g, '<br/>');
  };

  return (
    <div 
      ref={containerRef} 
      className={`prose-table:border prose-table:border-gray-300 ${className}`}
      dangerouslySetInnerHTML={{ __html: formatMarkdownTable(content) }}
    />
  );
};

export default MathContent;
