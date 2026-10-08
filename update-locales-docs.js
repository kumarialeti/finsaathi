const fs = require('fs');
const path = require('path');

const locales = ['en', 'hi', 'te'];
const files = locales.map(l => path.join(__dirname, 'frontend/src/locales', `${l}.json`));

const translations = {
  en: {
    "title": "Financial Documents",
    "subtitle": "Upload and query your financial documents.",
    "welcome_msg": "Upload your bank statements and ask me any questions about your transactions.",
    "uploading": "Uploading...",
    "upload_btn": "Upload PDF / Excel",
    "uploaded_files": "Uploaded files:",
    "no_documents": "No documents uploaded yet.",
    "chat_title": "Ask about your financial data",
    "analyzing": "Analyzing...",
    "placeholder": "How much did I spend last month?",
    "fetch_error": "Failed to fetch documents.",
    "upload_error": "Failed to upload document.",
    "chat_error": "Sorry, I encountered an error answering your question.",
    "fallback_reply": "Sorry, I could not generate a response."
  },
  te: {
    "title": "ఆర్థిక పత్రాలు",
    "subtitle": "మీ ఆర్థిక పత్రాలను అప్‌లోడ్ చేయండి మరియు విచారించండి.",
    "welcome_msg": "మీ బ్యాంక్ స్టేట్‌మెంట్‌లను అప్‌లోడ్ చేయండి మరియు మీ లావాదేవీల గురించి నన్ను ఏవైనా ప్రశ్నలు అడగండి.",
    "uploading": "అప్‌లోడ్ అవుతోంది...",
    "upload_btn": "PDF / Excel అప్‌లోడ్ చేయండి",
    "uploaded_files": "అప్‌లోడ్ చేసిన ఫైల్‌లు:",
    "no_documents": "ఇంకా పత్రాలు అప్‌లోడ్ చేయబడలేదు.",
    "chat_title": "మీ ఆర్థిక డేటా గురించి అడగండి",
    "analyzing": "విశ్లేషిస్తోంది...",
    "placeholder": "గత నెల నేను ఎంత ఖర్చు చేసాను?",
    "fetch_error": "పత్రాలను పొందడం విఫలమైంది.",
    "upload_error": "పత్రాన్ని అప్‌లోడ్ చేయడం విఫలమైంది.",
    "chat_error": "క్షమించండి, మీ ప్రశ్నకు సమాధానం ఇవ్వడంలో నేను లోపాన్ని ఎదుర్కొన్నాను.",
    "fallback_reply": "క్షమించండి, నేను ప్రతిస్పందనను సృష్టించలేకపోయాను."
  },
  hi: {
    "title": "वित्तीय दस्तावेज़",
    "subtitle": "अपने वित्तीय दस्तावेज़ अपलोड करें और प्रश्न पूछें।",
    "welcome_msg": "अपने बैंक विवरण अपलोड करें और मुझसे अपने लेनदेन के बारे में कोई भी प्रश्न पूछें।",
    "uploading": "अपलोड हो रहा है...",
    "upload_btn": "PDF / Excel अपलोड करें",
    "uploaded_files": "अपलोड की गई फ़ाइलें:",
    "no_documents": "अभी तक कोई दस्तावेज़ अपलोड नहीं किया गया है।",
    "chat_title": "अपने वित्तीय डेटा के बारे में पूछें",
    "analyzing": "विश्लेषण कर रहा है...",
    "placeholder": "पिछले महीने मैंने कितना खर्च किया?",
    "fetch_error": "दस्तावेज़ प्राप्त करने में विफल।",
    "upload_error": "दस्तावेज़ अपलोड करने में विफल।",
    "chat_error": "क्षमा करें, आपके प्रश्न का उत्तर देने में मुझे एक त्रुटि का सामना करना पड़ा।",
    "fallback_reply": "क्षमा करें, मैं कोई प्रतिक्रिया उत्पन्न नहीं कर सका।"
  }
};

files.forEach((file, idx) => {
  const content = JSON.parse(fs.readFileSync(file, 'utf8'));
  content.documents = translations[locales[idx]];
  fs.writeFileSync(file, JSON.stringify(content, null, 2));
});
