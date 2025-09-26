// Test flashcard generation
const testFlashcards = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/ai/generate-flashcards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: "Photosynthesis is the process by which plants convert light energy into chemical energy using sunlight, carbon dioxide, and water.",
        options: {
          cardCount: 3,
          difficulty: "medium",
          cardType: "basic",
          language: "en",
          includeImages: false,
          includeAudio: false,
          subject: "Biology"
        }
      })
    });

    const data = await response.json();
    console.log('✅ Flashcard Generation Test:');
    console.log('Status:', response.status);
    console.log('Title:', data.title);
    console.log('Total Cards:', data.totalCards);
    console.log('Difficulty:', data.difficulty);
    console.log('Sample Cards:');
    data.cards.forEach((card, index) => {
      console.log(`  ${index + 1}. ${card.front} → ${card.back}`);
    });
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testFlashcards();
