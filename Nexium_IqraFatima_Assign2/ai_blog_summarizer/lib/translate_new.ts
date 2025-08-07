// Professional translation service using Google Translate API
// This provides much better Urdu translations than dictionary-based approach

// Enhanced AI summary generation
export function generateSummary(content: string): string {
  if (!content || content.length < 50) {
    return "Content too short to summarize effectively.";
  }

  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  if (sentences.length < 3) {
    return content.substring(0, 200) + "...";
  }

  // Extract key sentences using multiple strategies
  const firstSentence = sentences[0]?.trim();
  const lastSentence = sentences[sentences.length - 1]?.trim();
  
  // Find sentences with keywords
  const keywordSentences = sentences.filter(sentence => {
    const lowerSentence = sentence.toLowerCase();
    return (
      lowerSentence.includes('important') ||
      lowerSentence.includes('significant') ||
      lowerSentence.includes('key') ||
      lowerSentence.includes('main') ||
      lowerSentence.includes('essential') ||
      lowerSentence.includes('critical') ||
      lowerSentence.includes('shows') ||
      lowerSentence.includes('reveals') ||
      lowerSentence.includes('according to') ||
      lowerSentence.includes('research') ||
      lowerSentence.includes('study') ||
      lowerSentence.includes('experts') ||
      lowerSentence.includes('analysis')
    );
  });

  // Select sentences for summary
  const summaryParts: string[] = [];
  
  if (firstSentence) summaryParts.push(firstSentence);
  
  // Add 2-3 keyword sentences
  keywordSentences.slice(0, 3).forEach(sentence => {
    if (!summaryParts.includes(sentence.trim())) {
      summaryParts.push(sentence.trim());
    }
  });
  
  // Add middle content if needed
  if (summaryParts.length < 4 && sentences.length > 10) {
    const middleIndex = Math.floor(sentences.length / 2);
    const middleSentence = sentences[middleIndex]?.trim();
    if (middleSentence && !summaryParts.includes(middleSentence)) {
      summaryParts.push(middleSentence);
    }
  }
  
  // Add conclusion if available and different
  if (lastSentence && !summaryParts.includes(lastSentence) && summaryParts.length < 5) {
    summaryParts.push(lastSentence);
  }
  
  let summary = summaryParts.join('. ');
  
  // Clean up the summary
  summary = summary
    .replace(/\s+/g, ' ')
    .replace(/\.\s*\./g, '.')
    .trim();
  
  // Ensure it ends with proper punctuation
  if (!summary.match(/[.!?]$/)) {
    summary += '.';
  }
  
  return summary.length > 50 ? summary : content.substring(0, 300) + "...";
}

// Main translation function using Google Translate API
export async function translateToUrdu(text: string): Promise<string> {
  if (!text || text.trim().length === 0) {
    return "";
  }

  try {
    console.log('🔄 Translating to Urdu using Google Translate API...');
    
    // Google Translate API endpoint (free tier)
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ur&dt=t&q=${encodeURIComponent(text)}`);
    
    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      const translatedText = data[0].map((item: string[]) => item[0]).join('');
      console.log('✅ Google Translate successful');
      return translatedText;
    } else {
      throw new Error('Invalid response format from Google Translate');
    }
  } catch (error) {
    console.warn('❌ Google Translate failed:', error);
    
    try {
      // Try MyMemory as backup
      return await translateToUrduWithMyMemory(text);
    } catch {
      console.warn('All translation services failed, using fallback dictionary');
      return translateWithFallback(text);
    }
  }
}

// Fallback dictionary translation (basic)
function translateWithFallback(text: string): string {
  // Simple word replacements for basic translation
  const basicDictionary: Record<string, string> = {
    'the': 'یہ',
    'and': 'اور',
    'is': 'ہے',
    'in': 'میں',
    'to': 'کو',
    'of': 'کا',
    'a': 'ایک',
    'that': 'کہ',
    'it': 'یہ',
    'with': 'کے ساتھ',
    'for': 'کے لیے',
    'as': 'جیسا',
    'was': 'تھا',
    'on': 'پر',
    'are': 'ہیں',
    'by': 'کے ذریعے',
    'this': 'یہ',
    'be': 'ہونا',
    'at': 'پر',
    'from': 'سے',
    'or': 'یا',
    'an': 'ایک',
    'you': 'آپ',
    'all': 'تمام',
    'not': 'نہیں',
    'but': 'لیکن',
    'can': 'سکتے ہیں',
    'have': 'ہے',
    'they': 'وہ',
    'one': 'ایک',
    'your': 'آپ کا',
    'will': 'گا',
    'more': 'زیادہ',
    'new': 'نیا',
    'time': 'وقت',
    'very': 'بہت',
    'when': 'جب',
    'much': 'زیادہ',
    'good': 'اچھا',
    'some': 'کچھ',
    'could': 'سکتے ہیں',
    'other': 'دوسرے',
    'after': 'کے بعد',
    'first': 'پہلے',
    'well': 'اچھا',
    'people': 'لوگ',
    'many': 'بہت سے',
    'work': 'کام',
    'life': 'زندگی',
    'only': 'صرف',
    'way': 'طریقہ',
    'may': 'مئی',
    'say': 'کہتے ہیں'
  };

  let result = text.toLowerCase();
  
  // Replace basic words
  Object.entries(basicDictionary).forEach(([english, urdu]) => {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    result = result.replace(regex, urdu);
  });

  return result;
}

// Backup translation using MyMemory API
export async function translateToUrduWithMyMemory(text: string): Promise<string> {
  try {
    console.log('🔄 Trying MyMemory API as backup...');
    
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ur`);
    
    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.responseData && data.responseData.translatedText) {
      console.log('✅ MyMemory translation successful');
      return data.responseData.translatedText;
    } else {
      throw new Error('Invalid response from MyMemory API');
    }
  } catch (error) {
    console.warn('❌ MyMemory API failed:', error);
    return translateWithFallback(text);
  }
}

// Additional utility function for content quality assessment
export function assessContentQuality(content: string): {
  score: number;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;
  
  if (content.length < 200) {
    score -= 30;
    issues.push("Content too short");
    suggestions.push("Try a longer article or blog post");
  }
  
  if (content.length > 10000) {
    score -= 10;
    issues.push("Content very long");
    suggestions.push("Summary may not capture all details");
  }
  
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length < 3) {
    score -= 25;
    issues.push("Too few sentences");
    suggestions.push("Content may be incomplete");
  }
  
  const words = content.split(/\s+/);
  const avgWordsPerSentence = words.length / sentences.length;
  if (avgWordsPerSentence < 5) {
    score -= 15;
    issues.push("Very short sentences");
    suggestions.push("May be a list or fragments rather than article content");
  }
  
  return { score: Math.max(0, score), issues, suggestions };
}
