document.addEventListener('DOMContentLoaded', () => {

    // Roadmap definitions
    const roadmapSteps = [
        {
            id: 'traffic-signs',
            title: 'Traffic Signs',
            icon: 'bi-sign-stop',
            description: 'Learn about warning, prohibition, mandatory, and information signs.',
            type: 'topic'
        },
        {
            id: 'road-rules',
            title: 'Road Rules',
            icon: 'bi-sign-turn-right',
            description: 'Understand the most important driving rules like right of way and speed limits.',
            type: 'topic'
        },
        {
            id: 'driving-situations',
            title: 'Driving Situations',
            icon: 'bi-car-front',
            description: 'Learn how to handle real-world scenarios on the road.',
            type: 'topic'
        },
        {
            id: 'safety-basics',
            title: 'Safety & Vehicle Basics',
            icon: 'bi-shield-check',
            description: 'Master seat belt importance, blind spots, and basic vehicle safety.',
            type: 'topic'
        },
        {
            id: 'practice-test',
            title: 'Practice Theory Test',
            icon: 'bi-ui-checks',
            description: 'Simulate the real exam. Test your knowledge with hundreds of questions to help you pass the theory test on your first try.',
            type: 'exam',
            url: 'exams.html'
        }
    ];

    // Initialize progress tracking
    let progress = JSON.parse(localStorage.getItem('studyProgress')) || {
        'traffic-signs': 'in-progress',
        'road-rules': 'not-started',
        'driving-situations': 'not-started',
        'safety-basics': 'not-started',
        'practice-test': 'not-started'
    };

    const roadmapContainer = document.getElementById('roadmap-steps');
    const viewRoadmap = document.getElementById('view-roadmap');
    const viewTopic = document.getElementById('view-topic');
    const topicContent = document.getElementById('topic-content');
    const topicTitle = document.getElementById('topic-title');
    const topicBadge = document.getElementById('topic-badge');
    const btnBackRoadmap = document.getElementById('btn-back-roadmap');
    const topicExtendedHeader = document.getElementById('topic-extended-header');

    // Content Database
    const topicsData = {
        'traffic-signs': {
            title: 'Traffic Signs',
            badge: 'Category: Visual Learning',
            renderType: 'categories',
            categories: [
                {
                    title: 'Warning Signs',
                    id: 'cat-warning',
                    items: [
                        { title: 'Curve Ahead', desc: 'The road ahead curves. Drivers should slow down and drive carefully.' },
                        { title: 'Sharp Turn', desc: 'A very sharp turn is approaching. Reduce speed before turning.' },
                        { title: 'Slippery Road', desc: 'The road may be slippery due to rain, ice, or oil.' },
                        { title: 'Pedestrian Crossing', desc: 'Pedestrians may cross the road ahead. Be ready to stop.' },
                        { title: 'School Zone', desc: 'Children may cross the road near a school. Drive slowly.' },
                        { title: 'Road Work Ahead', desc: 'Construction or maintenance work is happening on the road.' },
                        { title: 'Two-Way Traffic', desc: 'Traffic moves in both directions on the road ahead.' },
                        { title: 'Steep Hill', desc: 'The road ahead has a steep uphill or downhill slope.' },
                        { title: 'Animal Crossing', desc: 'Animals may cross the road in this area.' },
                        { title: 'Narrow Bridge', desc: 'The bridge ahead is narrow. Drive carefully.' },
                        { title: 'Traffic Signals Ahead', desc: 'A traffic light intersection is coming up.' },
                        { title: 'Roundabout Ahead', desc: 'A roundabout intersection is ahead. Prepare to slow down.' }
                    ]
                },
                {
                    title: 'Guidance Signs',
                    id: 'cat-guidance',
                    items: [
                        { title: 'Highway Direction', desc: 'Shows the direction to major highways.' },
                        { title: 'City Direction Sign', desc: 'Indicates the direction to nearby cities or towns.' },
                        { title: 'Exit Sign', desc: 'Shows where to leave the highway.' },
                        { title: 'Route Number Sign', desc: 'Indicates the number of the current road or route.' },
                        { title: 'Airport Direction', desc: 'Shows the direction toward an airport.' },
                        { title: 'Port Direction', desc: 'Indicates the direction to a seaport.' },
                        { title: 'Industrial Area Direction', desc: 'Guides drivers to an industrial zone.' },
                        { title: 'City Center Direction', desc: 'Indicates the direction to the city center.' },
                        { title: 'Parking Direction', desc: 'Shows the direction toward a parking area.' },
                        { title: 'Hospital Direction', desc: 'Indicates the direction to the nearest hospital.' },
                        { title: 'Tourist Attraction Direction', desc: 'Guides drivers toward tourist sites.' },
                        { title: 'Public Facility Direction', desc: 'Shows the direction to public buildings or facilities.' }
                    ]
                },
                {
                    title: 'Information Signs',
                    id: 'cat-information',
                    items: [
                        { title: 'Parking Area', desc: 'Indicates a place where vehicles may park.' },
                        { title: 'Fuel Station', desc: 'Shows the location of a nearby gas station.' },
                        { title: 'Hospital', desc: 'Indicates a nearby hospital or medical center.' },
                        { title: 'Rest Area', desc: 'A place where drivers can stop and rest.' },
                        { title: 'Restaurant', desc: 'Shows the location of a nearby restaurant.' },
                        { title: 'Hotel', desc: 'Indicates nearby accommodation.' },
                        { title: 'Telephone', desc: 'Shows the location of a public telephone.' },
                        { title: 'First Aid Station', desc: 'Medical assistance is available at this location.' },
                        { title: 'Bus Stop', desc: 'A designated place for buses to stop.' },
                        { title: 'Taxi Stand', desc: 'An area where taxis wait for passengers.' },
                        { title: 'Police Station', desc: 'Indicates the location of a police station.' },
                        { title: 'Tourist Information Center', desc: 'A place where visitors can get travel information.' }
                    ]
                },
                {
                    title: 'Road Markings',
                    id: 'cat-markings',
                    items: [
                        { title: 'Solid White Line', desc: 'Vehicles should not change lanes.' },
                        { title: 'Broken White Line', desc: 'Drivers may change lanes when safe.' },
                        { title: 'Double Solid Line', desc: 'Overtaking is not allowed in either direction.' },
                        { title: 'Pedestrian Crossing Lines', desc: 'Marks the area where pedestrians cross the road.' },
                        { title: 'Stop Line', desc: 'Drivers must stop before this line at intersections.' },
                        { title: 'Lane Direction Arrow', desc: 'Shows the direction vehicles must follow.' },
                        { title: 'Bus Lane Marking', desc: 'Indicates a lane reserved for buses.' },
                        { title: 'Bicycle Lane Marking', desc: 'Shows a lane reserved for bicycles.' },
                        { title: 'Speed Limit Marking', desc: 'Indicates the maximum speed allowed on the road.' },
                        { title: 'No Parking Marking', desc: 'Indicates areas where parking is prohibited.' },
                        { title: 'Yield Line', desc: 'Drivers must give way to other traffic.' },
                        { title: 'Center Line', desc: 'Separates traffic moving in opposite directions.' }
                    ]
                },
                {
                    title: 'Traffic Lights',
                    id: 'cat-traffic-lights',
                    items: [
                        { title: 'Red Light', desc: 'Drivers must stop completely.' },
                        { title: 'Green Light', desc: 'Drivers may go if the road is clear.' },
                        { title: 'Yellow Light', desc: 'Prepare to stop as the signal is about to change.' },
                        { title: 'Flashing Red Light', desc: 'Stop completely and proceed when safe.' },
                        { title: 'Flashing Yellow Light', desc: 'Slow down and proceed with caution.' },
                        { title: 'Green Arrow', desc: 'Vehicles may move in the direction of the arrow.' },
                        { title: 'Red Arrow', desc: 'Turning in the arrow direction is not allowed.' },
                        { title: 'Pedestrian Signal – Walk', desc: 'Pedestrians may cross the street.' },
                        { title: "Pedestrian Signal – Don't Walk", desc: 'Pedestrians must wait before crossing.' },
                        { title: 'Countdown Pedestrian Signal', desc: 'Shows the remaining time for pedestrians to cross.' },
                        { title: 'Lane Control Light', desc: 'Indicates whether a lane can be used or not.' },
                        { title: 'Railway Crossing Light', desc: 'Warns drivers to stop for approaching trains.' }
                    ]
                },
                {
                    title: 'Supplementary Signs',
                    id: 'cat-supplementary',
                    items: [
                        { title: 'Distance Plate', desc: 'Shows the distance to the condition indicated by the sign.' },
                        { title: 'Time Restriction Plate', desc: 'Indicates when a sign is valid (for example during certain hours).' },
                        { title: 'Vehicle Type Plate', desc: 'Specifies which vehicles the sign applies to.' },
                        { title: 'Arrow Direction Plate', desc: 'Shows the exact direction of the restriction or warning.' },
                        { title: 'Length Plate', desc: 'Indicates the length of the affected road section.' },
                        { title: 'Weight Limitation Plate', desc: 'Shows the maximum allowed vehicle weight.' },
                        { title: 'Height Limitation Plate', desc: 'Indicates the maximum vehicle height allowed.' },
                        { title: 'Road Condition Plate', desc: 'Provides additional information about road conditions.' },
                        { title: 'Weather Condition Plate', desc: 'Indicates that the sign applies only during certain weather conditions.' },
                        { title: 'End of Restriction Plate', desc: 'Shows that a restriction ends.' },
                        { title: 'Area Zone Plate', desc: 'Indicates that a rule applies to the entire area.' },
                        { title: 'Additional Instruction Plate', desc: 'Provides extra instructions related to another sign.' }
                    ]
                }
            ]
        },
        'road-rules': {
            title: 'Road Rules',
            badge: 'Category: Driving Theory',
            items: [
                { icon: 'bi-sign-turn-right', title: 'Right of Way', desc: 'Vehicles from the right generally have priority at uncontrolled intersections. Always yield to pedestrians.' },
                { icon: 'bi-speedometer', title: 'Speed Limits', desc: 'Never exceed the posted limit. Adjust speed to weather and road conditions.' },
                { icon: 'bi-distribute-horizontal', title: 'Lane Discipline', desc: 'Keep right on highways unless overtaking. Signal before changing lanes.' },
                { icon: 'bi-arrow-left-right', title: 'Overtaking Rules', desc: 'Overtake on the left. Ensure clear visibility and sufficient space before attempting to pass.' },
                { icon: 'bi-stoplights', title: 'Traffic Lights', desc: 'Red means stop. Yellow means clear intersection. Green means go if safe.' },
                { icon: 'bi-arrow-repeat', title: 'Roundabout Rules', desc: 'Traffic inside the roundabout has right of way. Signal when exiting.' }
            ],
            renderType: 'rules'
        },
        'driving-situations': {
            title: 'Driving Situations',
            badge: 'Category: Practical Application',
            items: [
                { icon: 'bi-cloud-rain', title: 'Wet Weather Driving', desc: 'Braking distance increases. Drive slower and smoothly. Use dipped headlights.' },
                { icon: 'bi-moon', title: 'Night Driving', desc: 'Use high beams only on unlit roads when no traffic is approaching. Watch for wildlife.' },
                { icon: 'bi-cloud-fog2', title: 'Fog and Low Visibility', desc: 'Use fog lights and keep a safe following distance. Do not use high beams as they reflect off the fog.' },
                { icon: 'bi-exclamation-triangle', title: 'Emergencies', desc: 'If your car breaks down, safely pull over, turn on hazard lights, and place a warning triangle 100 meters behind.' }
            ],
            renderType: 'rules'
        },
        'safety-basics': {
            title: 'Safety & Vehicle Basics',
            badge: 'Category: Safety Checks',
            items: [
                { icon: 'bi-person-bounding-box', title: 'Seat Belts', desc: 'Mandatory for all passengers. Securely fasten before starting the engine to reduce injuries in case of an accident.' },
                { icon: 'bi-arrows-expand', title: 'Safe Distance', desc: 'Maintain at least a 2-second gap from the vehicle ahead in ideal conditions, and double it in bad weather.' },
                { icon: 'bi-search', title: 'Mirror Checks', desc: 'Check mirrors every 5-10 seconds and always before braking, turning, or changing lanes.' },
                { icon: 'bi-eye-slash', title: 'Blind Spots', desc: 'Always check over your shoulder for vehicles or cyclists not visible in the mirrors.' },
                { icon: 'bi-wrench', title: 'Vehicle Maintenance', desc: 'Check tire pressure, oil levels, and all lights regularly before driving. Ensure windshield washer fluid is filled.' }
            ],
            renderType: 'rules'
        }
    };

    function renderRoadmap() {
        if (!roadmapContainer) return;
        roadmapContainer.innerHTML = '';

        roadmapSteps.forEach((step, index) => {
            const status = progress[step.id];

            let statusText = "Not Started";
            let badgeClass = "badge-not-started";
            let btnClass = "btn-outline-dark";
            let btnText = "Start Learning";

            if (status === 'completed') {
                statusText = "Completed";
                badgeClass = "badge-completed";
                btnClass = "btn-dark-green";
                btnText = "Review Material";
            } else if (status === 'in-progress') {
                statusText = "In Progress";
                badgeClass = "badge-in-progress";
                btnClass = "btn-primary";
                btnText = "Continue Learning";
            }

            if (step.type === 'exam') {
                btnText = "Go to Simulator";
                btnClass = "btn-orange";
            }

            const stepEl = document.createElement('div');
            stepEl.className = `roadmap-step status-${status}`;
            stepEl.innerHTML = `
                <div class="roadmap-point d-none d-md-flex">
                    ${status === 'completed' ? '<i class="bi bi-check-lg" style="font-size: 2rem;"></i>' : index + 1}
                </div>
                <div class="roadmap-card status-${status}">
                    <span class="badge-status ${badgeClass}">${statusText}</span>
                    <h4 class="fw-bold text-dark-green heading-font mb-3">
                        <i class="bi ${step.icon} text-orange me-2"></i>${step.title}
                    </h4>
                    <p class="text-muted small mb-4">${step.description}</p>
                    ${step.type === 'exam'
                    ? `<a href="${step.url}" class="btn ${btnClass} btn-rounded px-4 fw-bold shadow-sm d-inline-block">${btnText} <i class="bi bi-arrow-right ms-2"></i></a>`
                    : `<button class="btn ${btnClass} btn-rounded px-4 fw-bold shadow-sm" onclick="studyApp.openTopic('${step.id}')">${btnText}</button>`
                }
                </div>
                <!-- Spacer to push the card to one side -->
                <div class="d-none d-md-block" style="width: 42%;"></div>
            `;
            roadmapContainer.appendChild(stepEl);
        });
    }

    // Expose functionality globally for inline onclick
    window.studyApp = {
        openTopic: function (topicId) {
            const data = topicsData[topicId];
            if (!data) return;

            topicTitle.innerText = data.title;
            topicBadge.innerText = data.badge;
            topicContent.innerHTML = '';
            
            if (topicExtendedHeader) {
                topicExtendedHeader.innerHTML = '';
                topicExtendedHeader.classList.add('d-none');
            }

            let htmlContent = '';

            if (data.renderType === 'cards') {
                data.items.forEach(item => {
                    htmlContent += `
                        <div class="col-6 col-md-4 col-lg-3">
                            <div class="sign-card">
                                <div class="sign-image-wrapper">
                                    <img src="${item.image}" alt="${item.title}">
                                </div>
                                <h6 class="fw-bold text-dark-green">${item.title}</h6>
                                <p class="small text-muted mb-0">${item.desc}</p>
                            </div>
                        </div>
                    `;
                });
            } else if (data.renderType === 'rules') {
                data.items.forEach(item => {
                    htmlContent += `
                        <div class="col-md-6 mb-4">
                            <div class="rule-card">
                                <div class="rule-icon"><i class="bi ${item.icon}"></i></div>
                                <h5 class="fw-bold text-dark-green mb-3">${item.title}</h5>
                                <p class="text-muted mb-0" style="font-size: 0.95rem; line-height: 1.6;">${item.desc}</p>
                            </div>
                        </div>
                    `;
                });
            } else if (data.renderType === 'categories') {
                if (topicExtendedHeader) {
                    topicExtendedHeader.innerHTML = `
                        <h5 class="fw-bold text-dark-green mb-3">There are ${data.categories.length} types of categories of sign cards, what type you want to study?</h5>
                        <div class="d-flex flex-wrap gap-2">
                            ${data.categories.map(cat => `<a href="#${cat.id}" class="btn btn-outline-dark btn-sm rounded-pill px-3 py-2 fw-medium">${cat.title}</a>`).join('')}
                        </div>
                    `;
                    topicExtendedHeader.classList.remove('d-none');
                }

                data.categories.forEach(category => {
                    htmlContent += `
                        <div class="col-12 mt-5 mb-3 pt-4" id="${category.id}" style="scroll-margin-top: 100px;">
                            <h4 class="fw-bold text-dark-green border-bottom pb-3"><i class="bi bi-collection text-orange me-2"></i>${category.title}</h4>
                        </div>
                    `;
                    category.items.forEach(item => {
                        htmlContent += `
                            <div class="col-6 col-md-4 col-lg-3 mb-4">
                                <div class="sign-card d-flex flex-column h-100 position-relative">
                                    <div class="bg-light rounded-3 mb-3 d-flex align-items-center justify-content-center" style="height: 140px; border: 2px dashed #d0d7d4;">
                                        <div class="text-muted small text-center"><i class="bi bi-image fs-3 d-block mb-1"></i>Image Space</div>
                                    </div>
                                    <h6 class="fw-bold text-dark-green mb-2">${item.title}</h6>
                                    <p class="small text-muted mb-0 mt-auto">${item.desc}</p>
                                </div>
                            </div>
                        `;
                    });
                });
            }

            // Append completion button
            const isCompleted = progress[topicId] === 'completed';
            const btnClass = isCompleted ? 'btn-outline-dark shadow-sm' : 'btn-dark-green shadow-lg';
            const btnText = isCompleted ? 'Mark as In Progress <i class="bi bi-arrow-counterclockwise ms-2"></i>' : 'Mark as Completed <i class="bi bi-check-circle-fill ms-2"></i>';

            htmlContent += `
                <div class="col-12 mt-5 text-center" style="margin-bottom: 2rem;">
                    <button class="btn ${btnClass} btn-rounded px-5 py-3 fw-bold hover-lift" onclick="studyApp.toggleTopicStatus('${topicId}')">
                        ${btnText}
                    </button>
                </div>
            `;

            topicContent.innerHTML = htmlContent;

            viewRoadmap.classList.add('d-none');
            viewTopic.classList.remove('d-none');

            // Replay fade-in animation
            viewTopic.classList.remove('animate-fade');
            void viewTopic.offsetWidth; // trigger reflow
            viewTopic.classList.add('animate-fade');

            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        toggleTopicStatus: function (topicId) {
            const isCompleted = progress[topicId] === 'completed';

            if (isCompleted) {
                progress[topicId] = 'in-progress';
                localStorage.setItem('studyProgress', JSON.stringify(progress));
                renderRoadmap();
                // Stay on current page and update button
                this.openTopic(topicId);
            } else {
                progress[topicId] = 'completed';
                // Auto open the next module
                const currentIndex = roadmapSteps.findIndex(s => s.id === topicId);
                if (currentIndex !== -1 && currentIndex + 1 < roadmapSteps.length) {
                    const nextId = roadmapSteps[currentIndex + 1].id;
                    if (progress[nextId] === 'not-started') {
                        progress[nextId] = 'in-progress';
                    }
                }
                localStorage.setItem('studyProgress', JSON.stringify(progress));
                renderRoadmap();
                // When marked as complete, redirect back to roadmap
                if (btnBackRoadmap) btnBackRoadmap.click();
            }
        }
    };

    if (btnBackRoadmap) {
        btnBackRoadmap.addEventListener('click', () => {
            viewTopic.classList.add('d-none');
            viewRoadmap.classList.remove('d-none');

            viewRoadmap.classList.remove('animate-fade');
            void viewRoadmap.offsetWidth;
            viewRoadmap.classList.add('animate-fade');

            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    renderRoadmap();
});
