const MAX_HISTORY = 20;
const history = [];

export function addMessage(role, content) {
  history.push({ role, content });
  if (history.length > MAX_HISTORY) history.shift();
}

export function getHistory() {
  return [...history];
}

export function clearHistory() {
  history.length = 0;
}