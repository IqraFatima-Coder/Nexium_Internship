// Enhanced English to Urdu translation dictionary
const translationDictionary: Record<string, string> = {
  // Articles and prepositions
  "the": "یہ", "a": "ایک", "an": "ایک", "and": "اور", "or": "یا", "but": "لیکن",
  "is": "ہے", "are": "ہیں", "was": "تھا", "were": "تھے", "will": "ہوگا", "would": "ہوگا",
  "to": "کو", "of": "کا", "in": "میں", "on": "پر", "at": "پر", "by": "کے ذریعے",
  "for": "کے لیے", "with": "کے ساتھ", "from": "سے", "about": "کے بارے میں",
  "into": "میں", "through": "کے ذریعے", "during": "کے دوران", "before": "پہلے",
  "after": "بعد", "above": "اوپر", "below": "نیچے", "between": "کے بیچ",
  "among": "کے درمیان", "over": "اوپر", "under": "نیچے", "within": "کے اندر",
  
  // Technology and modern terms
  "technology": "ٹیکنالوجی", "artificial": "مصنوعی", "intelligence": "ذہانت",
  "computer": "کمپیوٹر", "internet": "انٹرنیٹ", "software": "سافٹ ویئر",
  "application": "ایپلیکیشن", "development": "ترقی", "programming": "پروگرامنگ",
  "data": "ڈیٹا", "algorithm": "الگورتھم", "machine": "مشین", "learning": "سیکھنا",
  "digital": "ڈیجیٹل", "innovation": "جدت", "solution": "حل", "system": "نظام",
  "platform": "پلیٹ فارم", "network": "نیٹ ورک", "security": "سیکیورٹی",
  "database": "ڈیٹابیس", "server": "سرور", "cloud": "کلاؤڈ", "mobile": "موبائل",
  "website": "ویب سائٹ", "online": "آن لائن", "social": "سماجی", "media": "میڈیا",
  "email": "ای میل", "video": "ویڈیو", "audio": "آڈیو", "image": "تصویر",
  "smartphone": "اسمارٹ فون", "tablet": "ٹیبلٹ", "laptop": "لیپ ٹاپ",
  
  // Business and economy
  "business": "کاروبار", "company": "کمپنی", "market": "بازار", "industry": "صنعت",
  "economy": "معیشت", "financial": "مالی", "investment": "سرمایہ کاری", "profit": "منافع",
  "customer": "گاہک", "service": "خدمت", "product": "پروڈکٹ", "brand": "برانڈ",
  "marketing": "مارکیٹنگ", "sales": "فروخت", "revenue": "آمدنی", "strategy": "حکمت عملی",
  "management": "انتظام", "leadership": "قیادت", "team": "ٹیم", "project": "منصوبہ",
  "startup": "نئی کمپنی", "entrepreneur": "کاروباری", 
  
  // Education and knowledge
  "education": "تعلیم", "school": "اسکول", "university": "یونیورسٹی", "college": "کالج",
  "student": "طالب علم", "teacher": "استاد", "professor": "پروفیسر", "course": "کورس",
  "knowledge": "علم", "research": "تحقیق", "study": "مطالعہ", "information": "معلومات",
  "book": "کتاب", "library": "لائبریری", "science": "سائنس", "mathematics": "ریاضی",
  
  // Health and medical
  "health": "صحت", "medical": "طبی", "doctor": "ڈاکٹر", "hospital": "ہسپتال",
  "medicine": "دوا", "treatment": "علاج", "patient": "مریض", "disease": "بیماری",
  "virus": "وائرس", "vaccine": "ویکسین", "pandemic": "وبا", "covid": "کووڈ",
  
  // Common verbs
  "create": "بنانا", "make": "بنانا", "build": "تعمیر کرنا", "develop": "ترقی دینا",
  "improve": "بہتر بنانا", "increase": "بڑھانا", "grow": "بڑھنا", "change": "تبدیل کرنا",
  "help": "مدد کرنا", "support": "سہارا دینا", "provide": "فراہم کرنا", "offer": "پیش کرنا",
  "use": "استعمال کرنا", "work": "کام کرنا", "start": "شروع کرنا", "begin": "شروع کرنا",
  "continue": "جاری رکھنا", "stop": "رک جانا", "end": "ختم کرنا", "finish": "مکمل کرنا",
  "learn": "سیکھنا", "teach": "سکھانا", "understand": "سمجھنا", "know": "جاننا",
  "think": "سوچنا", "believe": "یقین رکھنا", "feel": "محسوس کرنا", "see": "دیکھنا",
  "show": "دکھانا", "find": "تلاش کرنا", "search": "تلاش کرنا", "discover": "دریافت کرنا",
  "become": "بننا", "remain": "رہنا", "stay": "رہنا", "keep": "رکھنا",
  
  // Common adjectives
  "new": "نیا", "old": "پرانا", "young": "جوان", "modern": "جدید", "traditional": "روایتی",
  "good": "اچھا", "bad": "برا", "better": "بہتر", "best": "بہترین", "excellent": "بہترین",
  "important": "اہم", "significant": "اہم", "major": "بڑا", "minor": "چھوٹا",
  "large": "بڑا", "small": "چھوٹا", "big": "بڑا", "huge": "بہت بڑا", "tiny": "چھوٹا",
  "high": "اونچا", "low": "نیچا", "fast": "تیز", "slow": "آہستہ", "quick": "تیز",
  "easy": "آسان", "difficult": "مشکل", "hard": "سخت", "simple": "آسان", "complex": "پیچیدہ",
  "popular": "مقبول", "famous": "مشہور", "successful": "کامیاب", "effective": "مؤثر",
  "powerful": "طاقتور", "strong": "مضبوط", "weak": "کمزور", "rich": "امیر", "poor": "غریب",
  
  // Time and quantity
  "time": "وقت", "year": "سال", "month": "مہینہ", "week": "ہفتہ", "day": "دن",
  "hour": "گھنٹہ", "minute": "منٹ", "second": "سیکنڈ", "moment": "لمحہ",
  "today": "آج", "tomorrow": "کل", "yesterday": "کل", "now": "اب", "then": "پھر",
  "future": "مستقبل", "past": "ماضی", "present": "حال", "current": "موجودہ",
  "always": "ہمیشہ", "never": "کبھی نہیں", "sometimes": "کبھی کبھی", "often": "اکثر",
  "many": "بہت سے", "few": "کچھ", "some": "کچھ", "all": "تمام", "every": "ہر",
  "much": "بہت", "more": "زیادہ", "most": "سب سے زیادہ", "less": "کم", "least": "کم سے کم"
};

// Advanced phrase-based translation
const phraseDictionary: Record<string, string> = {
  // Technology phrases
  "artificial intelligence": "مصنوعی ذہانت",
  "machine learning": "مشین لرننگ",
  "data science": "ڈیٹا سائنس",
  "cloud computing": "کلاؤڈ کمپیوٹنگ",
  "software development": "سافٹ ویئر ڈیولپمنٹ",
  "web development": "ویب ڈیولپمنٹ",
  "mobile app": "موبائل ایپ",
  "social media": "سوشل میڈیا",
  "digital marketing": "ڈیجیٹل مارکیٹنگ",
  "e-commerce": "ای کامرس",
  "cyber security": "سائبر سیکیورٹی",
  "big data": "بڑا ڈیٹا",
  
  // Business phrases
  "business model": "کاروباری ماڈل",
  "market share": "مارکیٹ شیئر",
  "customer service": "کسٹمر سروس",
  "human resources": "انسانی وسائل",
  "supply chain": "سپلائی چین",
  "financial technology": "فنٹیک",
  "startup company": "اسٹارٹ اپ کمپنی",
  
  // Common expressions
  "in order to": "کے لیے",
  "as well as": "کے ساتھ ساتھ",
  "such as": "جیسے کہ",
  "according to": "کے مطابق",
  "in addition to": "کے علاوہ",
  "instead of": "کی بجائے",
  "because of": "کی وجہ سے",
  "due to": "کی وجہ سے",
  "in spite of": "کے باوجود",
  "as a result": "نتیجے میں",
  "for example": "مثال کے طور پر",
  "on the other hand": "دوسری طرف",
  "in conclusion": "خلاصہ یہ ہے",
  
  // Action phrases
  "continues to grow": "مسلسل بڑھ رہا ہے",
  "is becoming": "بن رہا ہے",
  "has increased": "بڑھ گیا ہے",
  "will continue": "جاری رہے گا",
  "are working": "کام کر رہے ہیں",
  "have developed": "ترقی کی ہے",
  "is expected": "توقع ہے",
  "can help": "مدد کر سکتا ہے",
  "should consider": "غور کرنا چاہیے"
};

// Advanced AI summarization with multiple strategies
export function generateSummary(text: string): string {
  try {
    if (!text || text.trim().length < 50) {
      return "Insufficient content for summarization.";
    }
    
    // Clean and prepare text
    const cleanText = text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?;:()-]/g, '')
      .trim();
    
    // Split into sentences with better regex
    const sentences = cleanText
      .split(/(?<=[.!?])\s+(?=[A-Z])/)
      .map(s => s.trim())
      .filter(s => s.length > 15 && s.split(' ').length >= 3);
    
    if (sentences.length === 0) {
      return "No meaningful sentences found for summarization.";
    }
    
    // Advanced sentence scoring
    const scoredSentences = sentences.map((sentence, index) => {
      let score = 0;
      const words = sentence.toLowerCase().split(/\s+/);
      const wordCount = words.length;
      
      // 1. Position scoring (beginning and end are important)
      if (index === 0) score += 5;
      if (index === 1) score += 3;
      if (index === sentences.length - 1) score += 3;
      if (index < sentences.length * 0.25) score += 2;
      
      // 2. Length scoring (prefer medium-length sentences)
      if (wordCount >= 10 && wordCount <= 30) score += 3;
      else if (wordCount >= 8 && wordCount <= 35) score += 2;
      else if (wordCount >= 5 && wordCount <= 40) score += 1;
      else if (wordCount > 40) score -= 2;
      
      // 3. Keyword importance scoring
      const highValueKeywords = [
        'important', 'significant', 'major', 'key', 'main', 'primary', 'essential',
        'critical', 'crucial', 'fundamental', 'breakthrough', 'innovative',
        'revolutionary', 'advanced', 'new', 'latest', 'recent', 'emerging'
      ];
      
      const techKeywords = [
        'artificial', 'intelligence', 'ai', 'machine', 'learning', 'technology',
        'digital', 'software', 'data', 'algorithm', 'innovation', 'development',
        'system', 'platform', 'solution', 'application', 'network', 'cloud'
      ];
      
      const businessKeywords = [
        'business', 'company', 'market', 'industry', 'growth', 'strategy',
        'customer', 'revenue', 'profit', 'investment', 'success', 'competitive'
      ];
      
      // Score for high-value keywords
      highValueKeywords.forEach(keyword => {
        if (sentence.toLowerCase().includes(keyword)) score += 3;
      });
      
      // Score for domain-specific keywords
      techKeywords.forEach(keyword => {
        if (sentence.toLowerCase().includes(keyword)) score += 2;
      });
      
      businessKeywords.forEach(keyword => {
        if (sentence.toLowerCase().includes(keyword)) score += 2;
      });
      
      // 4. Sentence structure scoring
      if (sentence.includes(':') || sentence.includes(';')) score += 1;
      if (sentence.match(/\d+/)) score += 1; // Contains numbers
      if (sentence.includes('%')) score += 2; // Contains percentages
      
      // 5. Negative scoring for unwanted content
      const unwantedPhrases = [
        'click here', 'read more', 'subscribe', 'follow us', 'contact us',
        'terms of service', 'privacy policy', 'cookie policy', 'advertisement'
      ];
      
      unwantedPhrases.forEach(phrase => {
        if (sentence.toLowerCase().includes(phrase)) score -= 5;
      });
      
      // 6. Diversity scoring (avoid repetitive content)
      const firstWords = sentence.split(' ').slice(0, 3).join(' ').toLowerCase();
      const repetitionPenalty = sentences
        .slice(0, index)
        .filter(s => s.split(' ').slice(0, 3).join(' ').toLowerCase() === firstWords)
        .length;
      score -= repetitionPenalty * 2;
      
      return { sentence, score, index, wordCount };
    });
    
    // Select best sentences
    const summaryLength = Math.min(
      Math.max(2, Math.ceil(sentences.length * 0.15)), // 15% of sentences, min 2
      5 // Maximum 5 sentences
    );
    
    const selectedSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, summaryLength)
      .sort((a, b) => a.index - b.index) // Restore original order
      .map(item => item.sentence);
    
    // Join and clean the summary
    let summary = selectedSentences.join(' ');
    
    // Post-processing
    summary = summary
      .replace(/\s+/g, ' ')
      .replace(/\s+([.!?:;,])/g, '$1')
      .trim();
    
    // Ensure proper ending
    if (!summary.match(/[.!?]$/)) {
      summary += '.';
    }
    
    // Add contextual introduction if needed
    const totalWords = cleanText.split(' ').length;
    const summaryWords = summary.split(' ').length;
    const compressionRatio = Math.round((summaryWords / totalWords) * 100);
    
    if (summary.length > 100 && compressionRatio < 50) {
      // Good compression achieved, keep as is
      return summary;
    } else if (summary.length < 100) {
      // Summary too short, try to expand
      const extraSentences = scoredSentences
        .sort((a, b) => b.score - a.score)
        .slice(summaryLength, summaryLength + 2)
        .sort((a, b) => a.index - b.index)
        .map(item => item.sentence);
      
      if (extraSentences.length > 0) {
        summary += ' ' + extraSentences.join(' ');
      }
    }
    
    return summary;
    
  } catch (error) {
    console.error('Summary generation error:', error);
    return "Unable to generate a meaningful summary from the provided content.";
  }
}

// Enhanced Urdu translation with context awareness
export function translateToUrdu(text: string): string {
  try {
    if (!text || text.trim().length === 0) {
      return "";
    }
    
    let translatedText = text.toLowerCase();
    
    // Step 1: Replace phrases first (most important)
    Object.entries(phraseDictionary).forEach(([english, urdu]) => {
      const regex = new RegExp(english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      translatedText = translatedText.replace(regex, urdu);
    });
    
    // Step 2: Word-by-word translation
    const tokens = translatedText.split(/(\s+|[.,!?;:()"])/);
    
    const translatedTokens = tokens.map(token => {
      // Skip whitespace and punctuation
      if (/^\s+$/.test(token) || /^[.,!?;:()"]+$/.test(token)) {
        return token;
      }
      
      // Clean word for lookup
      const cleanWord = token.replace(/[.,!?;:()"]/g, '').toLowerCase().trim();
      
      if (cleanWord && translationDictionary[cleanWord]) {
        // Preserve original punctuation
        return token.replace(cleanWord, translationDictionary[cleanWord]);
      }
      
      return token;
    });
    
    let result = translatedTokens.join('');
    
    // Step 3: Post-processing for better Urdu structure
    result = result
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/\s+([.,!?;:])/g, '$1') // Remove spaces before punctuation
      .replace(/([.,!?;:])\s*([.,!?;:])/g, '$1$2') // Remove duplicate punctuation
      .trim();
    
    // Step 4: Urdu grammar improvements
    result = result
      .replace(/ہے\s+کہ/g, 'ہے کہ')
      .replace(/کے\s+ساتھ/g, 'کے ساتھ')
      .replace(/کے\s+لیے/g, 'کے لیے')
      .replace(/کے\s+بارے\s+میں/g, 'کے بارے میں')
      .replace(/کے\s+ذریعے/g, 'کے ذریعے')
      .replace(/اور\s+اور/g, 'اور'); // Remove duplicate "and"
    
    // Step 5: Handle numbers and percentages
    result = result.replace(/(\d+)\s*%/g, '$1 فیصد');
    result = result.replace(/(\d+)\s+سال/g, '$1 سال');
    
    // Return result or fallback to original
    return result.length > 10 ? result : text;
    
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
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