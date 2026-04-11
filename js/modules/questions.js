const quizData = {
    categories: [
        { id: 'private', name: 'Private Cars', icon: 'bi-car-front-fill', description: 'License Category B' },
        { id: 'light-truck', name: 'Light Trucks', icon: 'bi-truck', description: 'License Category C1' },
        { id: 'heavy-truck', name: 'Heavy Trucks', icon: 'bi-truck-front-fill', description: 'License Category C' },
        { id: 'taxi', name: 'Taxi / Public', icon: 'bi-taxi-front-fill', description: 'License Category D1' },
        { id: 'motorcycle', name: 'Motorcycle', icon: 'bi-bicycle', description: 'License Category A' },
        { id: 'tractor', name: 'Tractor', icon: 'bi-cone-striped', description: 'License Category 1' }
    ],
    questions: {
        'private': [
            // Quiz 1
            [
                {
                    id: 1,
                    text: "What does a circular sign with a red border and a bicycle inside mean?",
                    image: null, // Placeholder for image path if needed
                    options: [
                        "Bicycles only permitted",
                        "No entry for bicycles",
                        "Priority for bicycles",
                        "Bicycle parking ahead"
                    ],
                    correctAnswer: 1, // index 1: "No entry for bicycles"
                    explanation: "Circular signs with red borders are prohibitory. This specific sign prohibits bicycles from entering the path or road."
                },
                {
                    id: 2,
                    text: "When approaching a pedestrian crossing without lights, what should you do?",
                    image: null,
                    options: [
                        "Speed up to pass quickly",
                        "Maintain speed and honk",
                        "Slow down and be prepared to stop for pedestrians",
                        "Only stop if there is a police officer"
                    ],
                    correctAnswer: 2,
                    explanation: "Safety first! Always slow down at crossings and give priority to pedestrians already on or waiting to cross."
                }
                // ... more questions can be added here
            ],
            // Quiz 2
            [
                {
                    id: 1,
                    text: "What is the maximum speed limit in a residential area unless otherwise posted?",
                    image: null,
                    options: [
                        "30 km/h",
                        "50 km/h",
                        "70 km/h",
                        "90 km/h"
                    ],
                    correctAnswer: 1,
                    explanation: "In most urban residential areas, the default speed limit is 50 km/h for safety."
                }
            ],
            // Quiz 3 - New
            [
                {
                    id: 1,
                    text: "What should you do when you see an ambulance behind you with sirens and flashing lights?",
                    image: null,
                    options: [
                        "Speed up to stay ahead of it",
                        "Stop immediately in the middle of the road",
                        "Safely pull over to the right and let it pass",
                        "Keep driving at your current speed"
                    ],
                    correctAnswer: 2,
                    explanation: "Emergency vehicles always have priority. Pull over safely to allow them to pass."
                }
            ],
            // Quiz 4 - New
            [
                {
                    id: 1,
                    text: "Which of the following is considered a major distraction while driving?",
                    image: null,
                    options: [
                        "Listening to a podcast at low volume",
                        "Checking a text message on your phone",
                        "Looking at the speedometer",
                        "Using the windshield wipers"
                    ],
                    correctAnswer: 1,
                    explanation: "Mobile phone usage is a primary source of driver distraction and a leading cause of accidents."
                }
            ]
        ],
        'motorcycle': [
            [
                {
                    id: 1,
                    text: "What is the most important piece of safety gear for a motorcyclist?",
                    image: null,
                    options: [
                        "Leather jacket",
                        "Gloves",
                        "Approved helmet",
                        "Boots"
                    ],
                    correctAnswer: 2,
                    explanation: "An approved helmet is the single most effective piece of safety equipment for preventing fatal head injuries."
                }
            ]
        ]
        // Other categories would follow the same structure
    }
};

// Export for use in quiz.js
if (typeof module !== 'undefined') {
    module.exports = quizData;
}
