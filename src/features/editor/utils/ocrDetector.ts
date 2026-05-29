import Tesseract from 'tesseract.js';
import type { MaskRect, MaskType } from '../types/mask.types';

export const autoDetectMasks = async (imageUrl: string, type: MaskType): Promise<Omit<MaskRect, 'id'>[]> => {
  const worker = await Tesseract.createWorker('eng');
  
  const ret = await worker.recognize(imageUrl, {}, { blocks: true });
  const data = ret.data as any;
  
  const newMasks: Omit<MaskRect, 'id'>[] = [];
  
  const aadhaarRegex = /\b\d{4}\s?\d{4}\s?\d{4}\b/;

  const allLines = data.blocks?.flatMap((block: any) => 
    block.paragraphs?.flatMap((para: any) => para.lines) || []
  ) || [];

  for (const line of allLines) {
    if (!line) continue;
    const text = line.text;
    
    const match = aadhaarRegex.exec(text);
    if (match) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        let foundWord = false;
        
        const cleanMatch = match[0].replace(/[^0-9]/g, '');
        
        for (const word of (line.words || [])) {
            const cleanWord = word.text.replace(/[^0-9]/g, '');
            
            // Check if the word is part of the matched pattern or vice-versa
            if ((cleanMatch.includes(cleanWord) || cleanWord.includes(cleanMatch)) && cleanWord.length >= 2) {
                minX = Math.min(minX, word.bbox.x0);
                minY = Math.min(minY, word.bbox.y0);
                maxX = Math.max(maxX, word.bbox.x1);
                maxY = Math.max(maxY, word.bbox.y1);
                foundWord = true;
            }
        }
        
        if (foundWord) {
            // Add a little padding
            const padding = 2;
            newMasks.push({
                x: minX - padding,
                y: minY - padding,
                width: (maxX - minX) + (padding * 2),
                height: (maxY - minY) + (padding * 2),
                type: type
            });
        } else {
            // fallback to line bbox
            newMasks.push({
                x: line.bbox.x0,
                y: line.bbox.y0,
                width: line.bbox.x1 - line.bbox.x0,
                height: line.bbox.y1 - line.bbox.y0,
                type: type
            });
        }
    }
  }

  await worker.terminate();
  return newMasks;
};
