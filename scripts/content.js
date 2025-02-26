function getApiKeyIfEnabled() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(["groqApiKey", "isEnabled"], (data) => {
            if (data.isEnabled && data.groqApiKey) {
                resolve(data.groqApiKey);
            } else {
                console.warn("GROQ API key not found or extension is disabled.");
                resolve(null);
            }
        });
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function initExtension() {
    const apiKey = await getApiKeyIfEnabled();
    if (!apiKey) {
        console.warn("GROQ API key not found. Please set your API key in the extension settings.");
        return;
    }

    processExistingPosts();
    observeNewPosts();
}

function estimateTimeSavedInSeconds(postText) {
    const wordCount = postText.split(/\s+/).length;

    if (wordCount <= 20) return 5;   // Short posts (~5 sec saved)
    if (wordCount <= 50) return 10;  // Medium posts (~10 sec saved)
    return 20;                       // Long posts (~20 sec saved)
}

function updateStats(postText) {
    chrome.storage.sync.get(["postCount", "timeSavedInMinutes"], (data) => {
        const newCount = (data.postCount || 0) + 1;
        const estimatedTimeSavedInSeconds = estimateTimeSavedInSeconds(postText);
        const newTimeSavedInMinutes = parseFloat(data.timeSavedInMinutes || 0) + estimatedTimeSavedInSeconds / 60;
        chrome.storage.sync.set({ postCount: newCount, timeSavedInMinutes: newTimeSavedInMinutes });
    });
}

async function generatePostSummary(postText) {
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
    const apiKey = await getApiKeyIfEnabled();      
    if (!apiKey) return null;

    // Get the selected language
    const languageData = await new Promise(resolve => {
        chrome.storage.sync.get('selectedLanguage', data => {
            resolve(data.selectedLanguage || 'en');
        });
    });

    // Language-specific instructions
    const languageInstructions = {
        'en': 'Summarize the content with a maximum of 10 words. Respond in English.',
        'es': 'Resume el contenido en un máximo de 10 palabras. Responde en español.',
        'zh': '用最多10个字概括内容。请用中文回答。',
        'hi': '10 शब्दों में सामग्री को संक्षेप में बताएं। हिंदी में उत्तर दें।',
        'ar': 'لخص المحتوى في 10 كلمات كحد أقصى. الرجاء الرد باللغة العربية.',
        'pt': 'Resuma o conteúdo em no máximo 10 palavras. Responda em português.',
        'bn': 'সর্বাধিক ১০টি শব্দে বিষয়বস্তু সংক্ষিপ্ত করুন। বাংলায় উত্তর দিন।',
        'ru': 'Обобщите содержание максимум в 10 словах. Ответьте на русском языке.',
        'ja': '10語以内で内容を要約してください。日本語で回答してください。',
        'de': 'Fassen Sie den Inhalt in maximal 10 Wörtern zusammen. Antworten Sie auf Deutsch.',
        'fr': 'Résumez le contenu en 10 mots maximum. Répondez en français.',
        'tr': 'İçeriği en fazla 10 kelimeyle özetleyin. Türkçe olarak yanıtlayın.',
        'ko': '10단어 이내로 내용을 요약하세요. 한국어로 답변해주세요.',
        'it': 'Riassumi il contenuto in massimo 10 parole. Rispondi in italiano.',
        'pl': 'Podsumuj treść w maksymalnie 10 słowach. Odpowiedz po polsku.',
        'uk': 'Узагальніть зміст максимум у 10 словах. Відповідайте українською мовою.',
        'nl': 'Vat de inhoud samen in maximaal 10 woorden. Antwoord in het Nederlands.',
        'vi': 'Tóm tắt nội dung trong tối đa 10 từ. Trả lời bằng tiếng Việt.',
        'th': 'สรุปเนื้อหาด้วยคำไม่เกิน 10 คำ ตอบเป็นภาษาไทย',
        'fa': 'محتوا را در حداکثر ۱۰ کلمه خلاصه کنید. لطفا به فارسی پاسخ دهید.',
        'id': 'Ringkas konten dalam maksimal 10 kata. Jawab dalam bahasa Indonesia.',
        'cs': 'Shrňte obsah v maximálně 10 slovech. Odpovězte v češtině.',
        'sv': 'Sammanfatta innehållet med maximalt 10 ord. Svara på svenska.',
        'ro': 'Rezumați conținutul în maximum 10 cuvinte. Răspundeți în limba română.',
        'hu': 'Foglalja össze a tartalmat maximum 10 szóban. Válaszoljon magyarul.'
    };

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gemma2-9b-it",
                messages: [
                    { 
                        role: "system", 
                        content: `You are a LinkedIn Summarizer. ${languageInstructions[languageData]}` 
                    },
                    { 
                        role: "user", 
                        content: postText 
                    }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error generating summary:', error);
        return null;
    }
}

async function processPost(post) {
    const parentDiv = post.closest('.feed-shared-update-v2__control-menu-container');
    if (!parentDiv) return;

    const summary = await generatePostSummary(post.innerText);
    
    const wrapper = document.createElement('div');
    while (parentDiv.firstChild) {
        wrapper.appendChild(parentDiv.firstChild);
    }

    wrapper.style.filter = 'blur(10px)';
    wrapper.style.transition = 'all 0.3s ease';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.position = 'relative';
    wrapper.style.opacity = '0.95';

    parentDiv.style.position = 'relative';

    // Create summary container
    const summaryContainer = document.createElement('div');
    summaryContainer.innerText = summary || 'Post summary not available';
    summaryContainer.style.position = 'absolute';
    summaryContainer.style.top = '30%';
    summaryContainer.style.left = '50%';
    summaryContainer.style.transform = 'translate(-50%, -50%)';
    summaryContainer.style.zIndex = '10';
    summaryContainer.style.color = '#0a66c2';
    summaryContainer.style.fontSize = '16px';
    summaryContainer.style.fontWeight = '600';
    summaryContainer.style.textAlign = 'center';
    summaryContainer.style.padding = '20px';
    summaryContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    summaryContainer.style.borderRadius = '8px';
    summaryContainer.style.maxWidth = '80%';

    const button = document.createElement('button');
    button.innerText = 'Click to View';
    button.style.position = 'absolute';
    button.style.top = '70%';
    button.style.left = '50%';
    button.style.transform = 'translate(-50%, -50%)';
    button.style.zIndex = '10';
    button.style.backgroundColor = '#0a66c2';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.padding = '12px 24px';
    button.style.fontSize = '14px';
    button.style.borderRadius = '24px';
    button.style.cursor = 'pointer';
    button.style.fontWeight = '600';
    button.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    button.style.transition = 'all 0.2s ease';

    button.onmouseover = () => {
        button.style.backgroundColor = '#004182';
        button.style.boxShadow = '0 0 12px rgba(0,0,0,0.15)';
    };

    button.onmouseout = () => {
        button.style.backgroundColor = '#0a66c2';
        button.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    };

    button.addEventListener('click', () => {
        wrapper.style.filter = '';
        wrapper.style.opacity = '1';
        button.style.display = 'none';
        summaryContainer.style.display = 'none';
    });

    parentDiv.appendChild(wrapper);
    parentDiv.appendChild(summaryContainer);
    parentDiv.appendChild(button);

    updateStats(post.innerText);
}

const debouncedProcessPost = debounce(processPost, 1000);

function processExistingPosts() {
    const posts = document.querySelectorAll('.update-components-update-v2__commentary');
    for (const post of posts) {
        debouncedProcessPost(post);
    }
}

function observeNewPosts() {
    const alreadyProcessedPosts = new Set();

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const posts = node.querySelectorAll('.update-components-update-v2__commentary');
                        for (const post of posts) {
                            if (!alreadyProcessedPosts.has(post)) {
                                alreadyProcessedPosts.add(post);
                                processPost(post);
                            }
                        }
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

initExtension();
