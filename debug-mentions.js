// Debug script for extractMentionUserIds
const { extractMentionUserIds } = require('./apps/web/src/lib/mentions.ts');

// Test data
const testContent = "@john hello";
const testUsers = [
  {
    id: "1",
    name: "john",
    email: "john@example.com",
    image: null
  }
];

console.log("Testing extractMentionUserIds:");
console.log("Content:", testContent);
console.log("Users:", testUsers);
console.log("Result:", extractMentionUserIds(testContent, testUsers));