// Chatbot-Regeln: Antworten auf Nutzerfragen
const chatbotRules = [
  {
    test: (t) => t.includes("anfrage") && t.includes("druckluft"),
    response: "Gerne! Für eine Anfrage zu Ihrer Druckluftversorgung nutzen Sie bitte unser Kontaktformular weiter unten auf der Seite – wählen Sie dort einfach \"Energieeffizienz\" als Anliegen aus. Wir melden uns innerhalb von 24 Stunden bei Ihnen."
  },
  {
    test: (t) => t.includes("leckage") || t.includes("basischeck"),
    response: "Unser Leckagemanagement findet Druckluft-Leckagen per Ultraschall- und Infrarot-Ortung – auch unter Druck. Mehr Infos finden Sie im Bereich \"Druckluft-Effizienz\" bzw. \"BasisCheck\" weiter oben auf der Seite."
  },
  {
    test: (t) => t.includes("energieberatung") || (t.includes("energie") && t.includes("beratung")),
    response: "Unsere Energieberatung umfasst Energieaudits nach DIN EN 16247, die Analyse Ihres Druckluft-, Gas- und Stromverbrauchs sowie Fördermittelberatung. Schauen Sie gerne im Bereich \"Energieberatung\" vorbei oder schreiben Sie uns direkt über das Formular."
  },
  {
    test: (t) => t.includes("fachplanung"),
    response: "In der Fachplanung entwickeln wir maßgeschneiderte Konzepte für Ihre Druckluft- und Gasversorgung – von der Bedarfsanalyse bis zur fertigen Ausschreibung. Details finden Sie im Bereich \"Fachplanung\"."
  },
  {
    test: (t) => t.includes("projektleitung") || t.includes("objektüberwachung"),
    response: "Wir begleiten Ihr Projekt von der Planung bis zur Umsetzung – inklusive Termin-, Kosten- und Qualitätskontrolle. Mehr dazu im Bereich \"Projektleitung\"."
  },
  {
    test: (t) => t.includes("preis") || t.includes("kosten") || t.includes("angebot"),
    response: "Die Kosten hängen stark von Ihrem individuellen Bedarf ab. Am schnellsten kommen Sie über das Kontaktformular zu einem unverbindlichen Angebot."
  },
  {
    test: (t) => t.includes("kontakt") || t.includes("telefon") || t.includes("email") || t.includes("e-mail"),
    response: "Sie erreichen uns telefonisch unter +49 152 28760622, per E-Mail an info@proenergie-versorgungstechnik.de oder direkt über das Kontaktformular weiter unten."
  }
];

// Standardantwort, falls keine Regel zutrifft
const chatbotDefaultResponse = "Danke für Ihre Nachricht! Für eine individuelle Antwort erreichen Sie unser Team am besten über das Kontaktformular weiter unten oder telefonisch unter +49 152 28760622.";

// Begrüßungsnachricht beim ersten Öffnen des Chats
const chatbotWelcomeMessage = "Hallo! 👋 Ich bin der ProEnergie Assistent. Wie kann ich Ihnen bei Druckluft, Gasversorgung oder Energieeffizienz weiterhelfen?";

let chatbotStarted = false;

// Fügt eine Nachricht zum Chat hinzu
function addChatbotMessage(text, sender) {
  const messages = document.getElementById('chatbot-messages');
  if (!messages) return;

  const msg = document.createElement('div');
  msg.className = 'chatbot-msg ' + sender;
  msg.textContent = text;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
  updateChatbotScrollButton();
}

// Scrollt den Chat nach unten
function scrollChatbotToBottom() {
  const messages = document.getElementById('chatbot-messages');
  if (!messages) return;
  messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
}

// Aktualisiert den "Nach unten"-Button
function updateChatbotScrollButton() {
  const messages = document.getElementById('chatbot-messages');
  const btn = document.getElementById('chatbot-scroll-bottom');
  if (!messages || !btn) return;

  const distanceFromBottom = messages.scrollHeight - messages.scrollTop - messages.clientHeight;
  if (distanceFromBottom > 40) {
    btn.classList.add('visible');
  } else {
    btn.classList.remove('visible');
  }
}

// Gibt die passende Antwort basierend auf der Nutzer-Nachricht zurück
function getChatbotResponse(userText) {
  const text = userText.toLowerCase();
  for (const rule of chatbotRules) {
    if (rule.test(text)) {
      return rule.response;
    }
  }
  return chatbotDefaultResponse;
}

// Sendet eine Nachricht
function sendChatbotMessage() {
  const input = document.getElementById('chatbot-input');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  addChatbotMessage(text, 'user');
  input.value = '';

  setTimeout(() => {
    addChatbotMessage(getChatbotResponse(text), 'bot');
  }, 400);
}

// Öffnet den Chatbot
function openChatbot() {
  const bubble = document.getElementById('chatbot-bubble');
  const window = document.getElementById('chatbot-window');
  if (!bubble || !window) return;

  bubble.classList.add('hidden-bubble');
  window.classList.add('chatbot-visible');

  if (!chatbotStarted) {
    chatbotStarted = true;
    setTimeout(() => addChatbotMessage(chatbotWelcomeMessage, 'bot'), 300);
  }
}

// Schließt den Chatbot
function closeChatbot() {
  const bubble = document.getElementById('chatbot-bubble');
  const window = document.getElementById('chatbot-window');
  if (!bubble || !window) return;

  window.classList.remove('chatbot-visible');
  bubble.classList.remove('hidden-bubble');
}

// Event-Listener für die Eingabe (Enter-Taste)
function initChatbotInput() {
  const input = document.getElementById('chatbot-input');
  if (input) {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') sendChatbotMessage();
    });
  }
}

// Event-Listener für das Scrollen der Nachrichten
function initChatbotScroll() {
  const messages = document.getElementById('chatbot-messages');
  if (messages) {
    messages.addEventListener('scroll', updateChatbotScrollButton);
  }
}

// Initialisiert den Chatbot
function initChatbot() {
  initChatbotInput();
  initChatbotScroll();
}

// Führe die Initialisierung aus, sobald das DOM geladen ist
document.addEventListener('DOMContentLoaded', initChatbot);