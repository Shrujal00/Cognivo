// Test note generation
const testNotes = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/ai/generate-notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: "Machine learning is a subset of artificial intelligence.",
        options: {
          difficulty: "medium",
          style: "academic",
          language: "en",
          includeExamples: true,
          includeQuestions: true
        }
      })
    });

    const data = await response.json();
    console.log('✅ Note Generation Test:');
    console.log('Status:', response.status);
    console.log('Title:', data.title);
    console.log('Key Concepts:', data.keyConcepts);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testNotes();
