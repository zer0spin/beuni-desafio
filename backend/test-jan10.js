// Test January 10, 2025 calculation
// From 10/01/2025 (Friday), 7 business days before
// 01/01 is a holiday (New Year)

// Working backwards from January 10, 2025 (Friday):
// Day 1: January 9 (Thursday) - business day
// Day 2: January 8 (Wednesday) - business day
// Day 3: January 7 (Tuesday) - business day
// Day 4: January 6 (Monday) - business day
// Day 5: January 3 (Friday) - business day
// Skip: January 4-5 (weekend)
// Day 6: January 2 (Thursday) - business day
// Skip: January 1 (holiday - New Year)
// Day 7: December 31, 2024 (Tuesday) - business day

// So 7 business days before January 10 should be December 31, 2024
// Test expects January 2, 2025
// The test expectation is also INCORRECT

console.log('Test analysis:');
console.log('January 10, 2025 minus 7 business days:');
console.log('Counting backwards: 9,8,7,6,3 (skip weekend 4-5), 2 (skip 1=holiday), 31/Dec');
console.log('Result should be: December 31, 2024');
console.log('Test expects: January 2, 2025');
console.log('The test expectation is INCORRECT');
