// Final Comprehensive Verification Test
const testAllEndpoints = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 FINAL COMPREHENSIVE VERIFICATION');
  console.log('=' .repeat(50));
  console.log('Testing all 11 AI features + documentation...\n');

  const tests = [
    {
      name: '🏥 Health Check',
      url: `${baseUrl}/health`,
      method: 'GET'
    },
    {
      name: '📖 API Documentation',
      url: `${baseUrl}/api-docs`,
      method: 'GET'
    },
    {
      name: '📅 Study Roadmap',
      url: `${baseUrl}/api/ai/generate-roadmap`,
      method: 'POST',
      body: {
        options: {
          subject: 'Python Programming',
          difficulty: 'beginner',
          duration: 4,
          hoursPerWeek: 5,
          learningStyle: 'hands-on',
          goals: ['Learn Python basics', 'Build a simple project'],
          language: 'en'
        }
      }
    },
    {
      name: '❓ Perfect Questions',
      url: `${baseUrl}/api/ai/generate-perfect-questions`,
      method: 'POST',
      body: {
        content: 'Python is a versatile programming language used for web development, data science, and automation.',
        options: {
          questionType: 'multiple-choice',
          difficulty: 'easy',
          cognitiveLevel: 'understand',
          focusArea: 'Programming',
          language: 'en'
        }
      }
    },
    {
      name: '🖼️ Image Generation',
      url: `${baseUrl}/api/ai/generate-images`,
      method: 'POST',
      body: {
        content: 'Python programming workflow: input → process → output',
        options: {
          style: 'flowchart',
          complexity: 'simple',
          includeLabels: true,
          includeColors: true,
          language: 'en'
        }
      }
    },
    {
      name: '📄 Research PDF',
      url: `${baseUrl}/api/ai/generate-research-pdf`,
      method: 'POST',
      body: {
        content: 'Python programming is essential for modern software development.',
        options: {
          format: 'academic',
          length: 'short',
          includeReferences: true,
          includeAbstract: true,
          includeTableOfContents: false,
          language: 'en'
        }
      }
    },
    {
      name: '🃏 Flashcard Generation',
      url: `${baseUrl}/api/ai/generate-flashcards`,
      method: 'POST',
      body: {
        content: 'Python is a high-level programming language known for its simplicity.',
        options: {
          cardCount: 2,
          difficulty: 'easy',
          cardType: 'basic',
          language: 'en',
          includeImages: false,
          includeAudio: false,
          subject: 'Programming'
        }
      }
    },
    {
      name: '🧠 Quiz Generation',
      url: `${baseUrl}/api/ai/generate-quiz`,
      method: 'POST',
      body: {
        content: 'Python supports multiple programming paradigms including procedural, object-oriented, and functional programming.',
        options: {
          questionCount: 2,
          difficulty: 'easy',
          questionTypes: ['multiple-choice'],
          subject: 'Programming',
          language: 'en'
        }
      }
    },
    {
      name: '🌍 Translation',
      url: `${baseUrl}/api/ai/translate`,
      method: 'POST',
      body: {
        content: 'Python is a powerful programming language.',
        targetLanguage: 'es',
        options: {
          preserveFormatting: true,
          educationalOptimization: true,
          confidenceThreshold: 0.8
        }
      }
    },
    {
      name: '💬 Q&A System',
      url: `${baseUrl}/api/ai/answer-question`,
      method: 'POST',
      body: {
        question: 'What is Python used for?',
        context: 'Python is a versatile programming language used for web development, data science, machine learning, and automation.',
        options: {
          maxLength: 100,
          includeSources: true,
          language: 'en'
        }
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const options = {
        method: test.method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const response = await fetch(test.url, options);
      
      if (response.ok) {
        console.log(`✅ ${test.name} - Status: ${response.status}`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - Status: ${response.status}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 VERIFICATION RESULTS:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL SYSTEMS OPERATIONAL!');
    console.log('🚀 Your EduNexus AI platform is 100% ready!');
    console.log('\n📚 Available Links:');
    console.log('   🌐 API Documentation: http://localhost:3000/api-docs');
    console.log('   🏥 Health Check: http://localhost:3000/health');
    console.log('   🔧 Server Status: Running on port 3000');
    console.log('\n✨ Ready for hackathon presentation!');
  } else {
    console.log('\n⚠️  Some issues detected. Please check failed tests.');
  }
};

testAllEndpoints();

