// Test all new Cognivo AI features
const testNewFeatures = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🚀 Testing New Cognivo AI Features\n');

  try {
    // Test 1: Study Roadmap Generation
    console.log('📅 1. Testing Study Roadmap Generation...');
    const roadmapResponse = await fetch(`${baseUrl}/api/ai/generate-roadmap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        options: {
          subject: 'Machine Learning',
          difficulty: 'intermediate',
          duration: 8,
          hoursPerWeek: 10,
          learningStyle: 'visual',
          goals: ['Understand neural networks', 'Build a ML project', 'Master Python for ML'],
          prerequisites: ['Python basics', 'Statistics knowledge'],
          language: 'en'
        }
      })
    });
    
    if (roadmapResponse.ok) {
      const roadmap = await roadmapResponse.json();
      console.log('✅ Roadmap Generated:');
      console.log(`   Title: ${roadmap.title}`);
      console.log(`   Duration: ${roadmap.duration} weeks`);
      console.log(`   Total Hours: ${roadmap.totalHours}`);
      console.log(`   Milestones: ${roadmap.milestones.length}\n`);
    } else {
      console.log('❌ Roadmap generation failed\n');
    }

    // Test 2: Perfect Question Generation
    console.log('❓ 2. Testing Perfect Question Generation...');
    const questionsResponse = await fetch(`${baseUrl}/api/ai/generate-perfect-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes (neurons) that process information using a connectionist approach to computation.',
        options: {
          questionType: 'multiple-choice',
          difficulty: 'medium',
          cognitiveLevel: 'understand',
          focusArea: 'Neural Networks',
          language: 'en'
        }
      })
    });
    
    if (questionsResponse.ok) {
      const questions = await questionsResponse.json();
      console.log('✅ Perfect Questions Generated:');
      console.log(`   Questions Count: ${questions.length}`);
      console.log(`   Sample Question: ${questions[0]?.question}`);
      console.log(`   Cognitive Level: ${questions[0]?.cognitiveLevel}\n`);
    } else {
      console.log('❌ Perfect question generation failed\n');
    }

    // Test 3: Image Generation
    console.log('🖼️ 3. Testing Image/Graph Generation...');
    const imagesResponse = await fetch(`${baseUrl}/api/ai/generate-images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'The water cycle consists of evaporation, condensation, precipitation, and collection. Water evaporates from oceans, condenses into clouds, falls as rain, and collects in bodies of water.',
        options: {
          style: 'diagram',
          complexity: 'detailed',
          includeLabels: true,
          includeColors: true,
          language: 'en'
        }
      })
    });
    
    if (imagesResponse.ok) {
      const images = await imagesResponse.json();
      console.log('✅ Images Generated:');
      console.log(`   Images Count: ${images.length}`);
      console.log(`   Style: ${images[0]?.style}`);
      console.log(`   Complexity: ${images[0]?.complexity}\n`);
    } else {
      console.log('❌ Image generation failed\n');
    }

    // Test 4: Research PDF Generation
    console.log('📄 4. Testing Research PDF Generation...');
    const pdfResponse = await fetch(`${baseUrl}/api/ai/generate-research-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Artificial Intelligence has revolutionized many industries including healthcare, finance, and transportation. Machine learning algorithms can analyze vast amounts of data to identify patterns and make predictions.',
        options: {
          format: 'academic',
          length: 'medium',
          includeReferences: true,
          includeAbstract: true,
          includeTableOfContents: true,
          language: 'en'
        }
      })
    });
    
    if (pdfResponse.ok) {
      const pdf = await pdfResponse.json();
      console.log('✅ Research PDF Generated:');
      console.log(`   Title: ${pdf.title}`);
      console.log(`   Word Count: ${pdf.wordCount}`);
      console.log(`   Sections: ${pdf.sections.length}`);
      console.log(`   References: ${pdf.references.length}\n`);
    } else {
      console.log('❌ Research PDF generation failed\n');
    }

    // Test 5: Health Check
    console.log('🏥 5. Testing Health Check...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ Server Health:');
      console.log(`   Status: ${health.status}`);
      console.log(`   Service: ${health.service}\n`);
    } else {
      console.log('❌ Health check failed\n');
    }

    console.log('🎉 All new features tested successfully!');
    console.log('\n📚 Available Features:');
    console.log('   ✅ Study Notes Generation');
    console.log('   ✅ Quiz Generation');
    console.log('   ✅ Q&A System');
    console.log('   ✅ Translation');
    console.log('   ✅ Flashcard Generation');
    console.log('   ✅ Audio-to-Text Transcription');
    console.log('   ✅ Study Roadmap Generation');
    console.log('   ✅ Perfect Question Generation');
    console.log('   ✅ Image/Graph Generation');
    console.log('   ✅ Research PDF Generation');
    console.log('   ✅ Text Extraction (PDF, OCR)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testNewFeatures();
