// background.js
console.log('Q-Links v2.0 background worker started.');

// Placeholder for future payment/analytics integrations
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'PURCHASE') {
    // TODO: integrate Stripe or analytics here
  }
});
