// Test Carnaval calculation manually
// From 10/03/2025 (Monday), 7 business days before
// 03/03 and 04/03 are Carnaval (holidays)

// Working backwards from March 10, 2025:
// Day 1: March 7 (Friday) - business day
// Day 2: March 6 (Thursday) - business day
// Day 3: March 5 (Wednesday) - business day
// Day 4: March 4 (Tuesday) - CARNAVAL (skip)
// Day 5: March 3 (Monday) - CARNAVAL (skip)
// Day 6: February 28 (Friday) - business day
// Day 7: February 27 (Thursday) - business day
// Day 8: February 26 (Wednesday) - business day
// Day 9: February 25 (Tuesday) - business day

// So 7 business days before March 10 should be February 25, not 27!
// The test expectation is wrong

console.log('Test analysis:');
console.log('March 10, 2025 minus 7 business days:');
console.log('Counting backwards: 7,6,5 (skip 4,3), 28,27,26,25');
console.log('Result should be: February 25, 2025');
console.log('Test expects: February 27, 2025');
console.log('The test expectation is INCORRECT');
