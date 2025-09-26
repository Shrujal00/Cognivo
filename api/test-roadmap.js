// Test roadmap generation specifically
const testRoadmap = async () => {
  try {
    console.log('Testing Roadmap Generation...');
    
    const response = await fetch('http://localhost:3000/api/ai/generate-roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        options: {
          subject: 'Machine Learning',
          difficulty: 'intermediate',
          duration: 8,
          hoursPerWeek: 10,
          learningStyle: 'visual',
          goals: ['Understand neural networks', 'Build a ML project'],
          language: 'en'
        }
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const data = await response.text();
    console.log('Response body:', data);
    
    if (response.ok) {
      const roadmap = JSON.parse(data);
      console.log('✅ Roadmap Generated Successfully!');
      console.log('Title:', roadmap.title);
      console.log('Milestones:', roadmap.milestones?.length || 0);
    } else {
      console.log('❌ Roadmap generation failed');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testRoadmap();
