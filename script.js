class HackerNewsAI {
    constructor() {
        this.apiBase = 'https://hacker-news.firebaseio.com/v0';
        this.stories = [];
        this.currentStory = null;
        this.aiBuilder = null;
        
        this.init();
    }
    
    async init() {
        await this.loadStories();
        this.setupEventListeners();
    }
    
    async loadStories() {
        try {
            const loading = document.getElementById('loading');
            const storyList = document.getElementById('storyList');
            
            // Get top stories
            const response = await fetch(`${this.apiBase}/topstories.json`);
            const storyIds = await response.json();
            
            // Load first 20 stories
            const storyPromises = storyIds.slice(0, 20).map(id => 
                fetch(`${this.apiBase}/item/${id}.json`).then(r => r.json())
            );
            
            this.stories = await Promise.all(storyPromises);
            
            loading.style.display = 'none';
            this.renderStories();
            
        } catch (error) {
            console.error('Error loading stories:', error);
            document.getElementById('loading').innerHTML = '<p>Error loading stories. Please refresh.</p>';
        }
    }
    
    renderStories() {
        const storyList = document.getElementById('storyList');
        
        storyList.innerHTML = this.stories.map(story => {
            if (!story || !story.title) return '';
            
            const timeAgo = this.getTimeAgo(story.time);
            const domain = story.url ? new URL(story.url).hostname : 'self';
            
            return `
                <div class="story-item" data-id="${story.id}">
                    <div class="story-meta">
                        <span class="story-score">${story.score || 0} points</span>
                        <span>by ${story.by || 'unknown'}</span>
                        <span>${timeAgo}</span>
                        <span class="story-comments">${story.descendants || 0} comments</span>
                    </div>
                    <h3 class="story-title">${story.title}</h3>
                    <div class="story-url">${domain}</div>
                </div>
            `;
        }).join('');
    }
    
    setupEventListeners() {
        const storyList = document.getElementById('storyList');
        const modal = document.getElementById('aiModal');
        const closeBtn = document.getElementById('closeBtn');
        
        storyList.addEventListener('click', (e) => {
            const storyItem = e.target.closest('.story-item');
            if (storyItem) {
                const storyId = storyItem.dataset.id;
                this.openStoryBuilder(storyId);
            }
        });
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            if (this.aiBuilder) {
                this.aiBuilder.stop();
            }
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                if (this.aiBuilder) {
                    this.aiBuilder.stop();
                }
            }
        });
    }
    
    async openStoryBuilder(storyId) {
        this.currentStory = this.stories.find(s => s.id == storyId);
        if (!this.currentStory) return;
        
        const modal = document.getElementById('aiModal');
        const modalTitle = document.getElementById('modalTitle');
        
        modalTitle.textContent = `AI Building: ${this.currentStory.title}`;
        modal.style.display = 'block';
        
        // Initialize AI Builder
        this.aiBuilder = new AIBuilder(this.currentStory);
        await this.aiBuilder.start();
    }
    
    getTimeAgo(timestamp) {
        const now = Date.now() / 1000;
        const diff = now - timestamp;
        
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    }
}

class AIBuilder {
    constructor(story) {
        this.story = story;
        this.buildSteps = [
            { id: 'analyze', icon: '🔍', text: 'Analyzing story content', status: 'pending' },
            { id: 'html', icon: '📄', text: 'Generating HTML structure', status: 'pending' },
            { id: 'css', icon: '🎨', text: 'Creating visual styles', status: 'pending' },
            { id: 'javascript', icon: '⚡', text: 'Adding interactivity', status: 'pending' },
            { id: 'test', icon: '🧪', text: 'Testing application', status: 'pending' },
            { id: 'deploy', icon: '🚀', text: 'Deploying application', status: 'pending' }
        ];
        
        this.generatedCode = {
            html: '',
            css: '',
            javascript: ''
        };
        
        this.isRunning = false;
        this.currentStepIndex = 0;
    }
    
    async start() {
        this.isRunning = true;
        this.renderBuildSteps();
        this.updateStatus('Initializing AI Builder...');
        
        await this.sleep(1000);
        
        for (let i = 0; i < this.buildSteps.length && this.isRunning; i++) {
            this.currentStepIndex = i;
            await this.executeStep(this.buildSteps[i]);
        }
    }
    
    stop() {
        this.isRunning = false;
    }
    
    async executeStep(step) {
        // Mark step as active
        step.status = 'active';
        this.renderBuildSteps();
        
        switch (step.id) {
            case 'analyze':
                await this.analyzeStory();
                break;
            case 'html':
                await this.generateHTML();
                break;
            case 'css':
                await this.generateCSS();
                break;
            case 'javascript':
                await this.generateJavaScript();
                break;
            case 'test':
                await this.testApplication();
                break;
            case 'deploy':
                await this.deployApplication();
                break;
        }
        
        // Mark step as completed
        step.status = 'completed';
        this.renderBuildSteps();
        
        await this.sleep(500);
    }
    
    async analyzeStory() {
        this.updateStatus('Analyzing story content and determining application type...');
        await this.sleep(2000);
        
        // Simulate AI analysis
        const analysisText = `Analyzing "${this.story.title}"...\n\nContent type: ${this.getContentType()}\nComplexity: ${this.getComplexity()}\nRecommended UI: ${this.getRecommendedUI()}`;
        
        this.updateStatus('Analysis complete! Planning application architecture...');
    }
    
    async generateHTML() {
        this.updateStatus('Generating HTML structure based on story content...');
        
        // Generate HTML based on story type
        await this.sleep(2000);
        
        this.generatedCode.html = this.generateHTMLContent();
        this.renderCodePanel('HTML', this.generatedCode.html, '📄');
        
        await this.sleep(1000);
        this.updateStatus('HTML structure generated successfully!');
    }
    
    async generateCSS() {
        this.updateStatus('Creating beautiful visual styles...');
        
        await this.sleep(2500);
        
        this.generatedCode.css = this.generateCSSContent();
        this.renderCodePanel('CSS', this.generatedCode.css, '🎨');
        
        await this.sleep(1000);
        this.updateStatus('Visual styles applied successfully!');
    }
    
    async generateJavaScript() {
        this.updateStatus('Adding interactive functionality...');
        
        await this.sleep(3000);
        
        this.generatedCode.javascript = this.generateJSContent();
        this.renderCodePanel('JavaScript', this.generatedCode.javascript, '⚡');
        
        await this.sleep(1000);
        this.updateStatus('Interactive features implemented!');
    }
    
    async testApplication() {
        this.updateStatus('Running comprehensive tests...');
        
        await this.sleep(2000);
        
        // Simulate testing and potential errors
        const hasErrors = Math.random() < 0.3; // 30% chance of errors
        
        if (hasErrors) {
            await this.handleTestErrors();
        } else {
            this.updateStatus('All tests passed! Application is ready.');
        }
        
        this.renderPreview();
    }
    
    async handleTestErrors() {
        this.updateStatus('⚠️ Errors detected! Analyzing and fixing...');
        
        const errors = [
            'CSS selector conflict in line 45',
            'JavaScript function undefined: handleClick',
            'HTML validation error: unclosed div tag'
        ];
        
        const randomError = errors[Math.floor(Math.random() * errors.length)];
        this.renderError(randomError);
        
        await this.sleep(2000);
        this.updateStatus('Fixing detected errors...');
        
        await this.sleep(1500);
        this.updateStatus('Errors fixed! Re-running tests...');
        
        await this.sleep(1000);
        this.updateStatus('All tests passed after fixes!');
    }
    
    async deployApplication() {
        this.updateStatus('Deploying interactive application...');
        
        await this.sleep(2000);
        this.renderPreview();
        
        await this.sleep(1000);
        this.updateStatus('🎉 Application deployed successfully! Ready for interaction.');
    }
    
    generateHTMLContent() {
        const contentType = this.getContentType();
        
        if (contentType === 'data-visualization') {
            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.story.title}</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
</head>
<body>
    <div class="app-container">
        <header>
            <h1>${this.story.title}</h1>
            <p class="story-meta">Score: ${this.story.score} | Comments: ${this.story.descendants}</p>
        </header>
        <div class="visualization-container">
            <div id="chart"></div>
            <div class="controls">
                <button id="randomize">Generate New Data</button>
                <button id="animate">Animate</button>
            </div>
        </div>
    </div>
</body>
</html>`;
        } else if (contentType === 'interactive-demo') {
            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.story.title}</title>
</head>
<body>
    <div class="demo-container">
        <h1>${this.story.title}</h1>
        <div class="demo-area">
            <div class="feature-showcase">
                <div class="feature-card" data-feature="1">
                    <h3>Interactive Feature 1</h3>
                    <p>Click to explore this functionality</p>
                </div>
                <div class="feature-card" data-feature="2">
                    <h3>Dynamic Content</h3>
                    <p>Watch this content change in real-time</p>
                </div>
                <div class="feature-card" data-feature="3">
                    <h3>User Controls</h3>
                    <p>Take control of the experience</p>
                </div>
            </div>
            <div class="output-area" id="output">
                Select a feature to see it in action!
            </div>
        </div>
    </div>
</body>
</html>`;
        } else {
            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.story.title}</title>
</head>
<body>
    <div class="article-container">
        <header>
            <h1>${this.story.title}</h1>
            <div class="article-meta">
                <span>By ${this.story.by}</span>
                <span>${this.story.score} points</span>
                <span>${this.story.descendants} comments</span>
            </div>
        </header>
        <div class="content-area">
            <div class="main-content">
                <p>This interactive application helps you explore the story content in an engaging way.</p>
                <div class="interactive-elements">
                    <button class="action-btn" id="summarize">AI Summary</button>
                    <button class="action-btn" id="analyze">Deep Analysis</button>
                    <button class="action-btn" id="related">Find Related</button>
                </div>
                <div class="result-area" id="results">
                    Click any button above to interact with the content!
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
        }
    }
    
    generateCSSContent() {
        return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
}

.app-container, .demo-container, .article-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

header {
    text-align: center;
    margin-bottom: 40px;
    background: rgba(255, 255, 255, 0.95);
    padding: 30px;
    border-radius: 20px;
    backdrop-filter: blur(10px);
}

h1 {
    font-size: 2.5rem;
    margin-bottom: 15px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.story-meta, .article-meta {
    color: #666;
    font-size: 1rem;
}

.visualization-container {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 30px;
    backdrop-filter: blur(10px);
}

#chart {
    width: 100%;
    height: 400px;
    background: #f8f9fa;
    border: 2px dashed #ddd;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 20px;
}

.controls {
    display: flex;
    gap: 15px;
    justify-content: center;
}

.controls button, .action-btn {
    background: linear-gradient(45deg, #4ecdc4, #44a08d);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.controls button:hover, .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.demo-area {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 30px;
    backdrop-filter: blur(10px);
}

.feature-showcase {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.feature-card {
    background: linear-gradient(135deg, #ff6b6b, #ffd93d);
    color: white;
    padding: 25px;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.feature-card h3 {
    margin-bottom: 10px;
    font-size: 1.3rem;
}

.output-area, .result-area {
    background: #f8f9fa;
    padding: 25px;
    border-radius: 15px;
    min-height: 200px;
    font-size: 1.1rem;
    line-height: 1.6;
}

.content-area {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 30px;
    backdrop-filter: blur(10px);
}

.interactive-elements {
    display: flex;
    gap: 15px;
    margin: 20px 0;
    flex-wrap: wrap;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.animated {
    animation: fadeIn 0.6s ease-out;
}

@media (max-width: 768px) {
    .interactive-elements {
        flex-direction: column;
    }
    
    .feature-showcase {
        grid-template-columns: 1fr;
    }
    
    h1 {
        font-size: 1.8rem;
    }
}`;
    }
    
    generateJSContent() {
        const contentType = this.getContentType();
        
        if (contentType === 'data-visualization') {
            return `document.addEventListener('DOMContentLoaded', function() {
    let data = generateRandomData();
    
    function generateRandomData() {
        return Array.from({length: 20}, (_, i) => ({
            x: i,
            y: Math.random() * 100 + 10
        }));
    }
    
    function renderChart() {
        const svg = d3.select('#chart').html('').append('svg')
            .attr('width', '100%')
            .attr('height', '100%');
            
        const width = 800;
        const height = 350;
        
        const xScale = d3.scaleLinear()
            .domain([0, data.length - 1])
            .range([50, width - 50]);
            
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.y)])
            .range([height - 50, 50]);
            
        // Draw bars
        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', (d, i) => xScale(i) - 15)
            .attr('y', d => yScale(d.y))
            .attr('width', 30)
            .attr('height', d => height - 50 - yScale(d.y))
            .attr('fill', (d, i) => \`hsl(\${i * 18}, 70%, 60%)\`)
            .on('mouseover', function(event, d) {
                d3.select(this).attr('opacity', 0.7);
            })
            .on('mouseout', function() {
                d3.select(this).attr('opacity', 1);
            });
    }
    
    document.getElementById('randomize').addEventListener('click', function() {
        data = generateRandomData();
        renderChart();
    });
    
    document.getElementById('animate').addEventListener('click', function() {
        const svg = d3.select('#chart svg');
        svg.selectAll('rect')
            .transition()
            .duration(1000)
            .attr('height', d => Math.random() * 200 + 50);
    });
    
    renderChart();
});`;
        } else if (contentType === 'interactive-demo') {
            return `document.addEventListener('DOMContentLoaded', function() {
    const output = document.getElementById('output');
    const features = document.querySelectorAll('.feature-card');
    
    const demos = {
        '1': function() {
            output.innerHTML = \`
                <h3>Interactive Feature Demo</h3>
                <div style="margin: 20px 0;">
                    <input type="range" id="slider" min="0" max="100" value="50" style="width: 100%;">
                    <p>Value: <span id="value">50</span></p>
                </div>
                <div id="visual" style="width: 100%; height: 100px; background: linear-gradient(90deg, #ff6b6b, #4ecdc4); border-radius: 10px; margin-top: 20px;"></div>
            \`;
            
            const slider = document.getElementById('slider');
            const valueSpan = document.getElementById('value');
            const visual = document.getElementById('visual');
            
            slider.addEventListener('input', function() {
                valueSpan.textContent = this.value;
                visual.style.opacity = this.value / 100;
            });
        },
        '2': function() {
            output.innerHTML = \`
                <h3>Dynamic Content Generator</h3>
                <button id="generate" style="margin: 20px 0; padding: 10px 20px; background: #4ecdc4; color: white; border: none; border-radius: 5px; cursor: pointer;">Generate Content</button>
                <div id="dynamic-content"></div>
            \`;
            
            document.getElementById('generate').addEventListener('click', function() {
                const content = document.getElementById('dynamic-content');
                const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                
                content.innerHTML += \`
                    <div style="background: \${randomColor}; color: white; padding: 15px; margin: 10px 0; border-radius: 10px; animation: fadeIn 0.5s ease;">
                        <h4>Dynamic Item \${Date.now()}</h4>
                        <p>Generated at: \${new Date().toLocaleTimeString()}</p>
                    </div>
                \`;
            });
        },
        '3': function() {
            output.innerHTML = \`
                <h3>User Control Panel</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0;">
                    <button class="control-btn" data-action="bg-change">Change Background</button>
                    <button class="control-btn" data-action="text-size">Toggle Text Size</button>
                    <button class="control-btn" data-action="theme">Switch Theme</button>
                    <button class="control-btn" data-action="animate">Animate Elements</button>
                </div>
                <div id="controlled-area" style="padding: 20px; background: #f8f9fa; border-radius: 10px; transition: all 0.3s ease;">
                    <p>This area responds to your controls!</p>
                </div>
            \`;
            
            document.querySelectorAll('.control-btn').forEach(btn => {
                btn.style.cssText = 'padding: 10px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;';
                
                btn.addEventListener('click', function() {
                    const action = this.dataset.action;
                    const area = document.getElementById('controlled-area');
                    
                    switch(action) {
                        case 'bg-change':
                            area.style.background = \`hsl(\${Math.random() * 360}, 70%, 90%)\`;
                            break;
                        case 'text-size':
                            area.style.fontSize = area.style.fontSize === '1.5rem' ? '1rem' : '1.5rem';
                            break;
                        case 'theme':
                            area.style.color = area.style.color === 'white' ? 'black' : 'white';
                            area.style.background = area.style.background.includes('333') ? '#f8f9fa' : '#333';
                            break;
                        case 'animate':
                            area.style.transform = 'rotate(5deg) scale(1.1)';
                            setTimeout(() => area.style.transform = 'none', 500);
                            break;
                    }
                });
            });
        }
    };
    
    features.forEach(feature => {
        feature.addEventListener('click', function() {
            const featureId = this.dataset.feature;
            if (demos[featureId]) {
                demos[featureId]();
                output.classList.add('animated');
                setTimeout(() => output.classList.remove('animated'), 600);
            }
        });
    });
});`;
        } else {
            return `document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.action-btn');
    const results = document.getElementById('results');
    
    const actions = {
        summarize: function() {
            results.innerHTML = \`
                <h3>AI Summary</h3>
                <div class="summary-content">
                    <p>🤖 Analyzing story: "\${'${this.story.title}'}"</p>
                    <div class="loading-dots">
                        <span>.</span><span>.</span><span>.</span>
                    </div>
                </div>
            \`;
            
            setTimeout(() => {
                results.innerHTML = \`
                    <h3>AI Summary</h3>
                    <div class="summary-result">
                        <p><strong>Key Points:</strong></p>
                        <ul>
                            <li>Story has \${${this.story.score}} points and \${${this.story.descendants}} comments</li>
                            <li>Posted by \${'${this.story.by}'}</li>
                            <li>High engagement indicates significant community interest</li>
                            <li>Content appears to be relevant to current tech discussions</li>
                        </ul>
                        <p><strong>Sentiment:</strong> Generally positive community response</p>
                    </div>
                \`;
            }, 2000);
        },
        
        analyze: function() {
            results.innerHTML = \`
                <h3>Deep Analysis</h3>
                <div class="analysis-content">
                    <div class="metric">
                        <span class="label">Engagement Score:</span>
                        <div class="bar">
                            <div class="fill" style="width: \${Math.min((${this.story.score} / 100) * 100, 100)}%"></div>
                        </div>
                        <span>\${${this.story.score}} points</span>
                    </div>
                    <div class="metric">
                        <span class="label">Discussion Level:</span>
                        <div class="bar">
                            <div class="fill" style="width: \${Math.min((${this.story.descendants} / 50) * 100, 100)}%"></div>
                        </div>
                        <span>\${${this.story.descendants}} comments</span>
                    </div>
                    <div class="insights">
                        <h4>Insights:</h4>
                        <p>This story shows \${${this.story.score} > 100 ? 'high' : 'moderate'} community engagement.</p>
                        <p>Discussion level is \${${this.story.descendants} > 50 ? 'very active' : 'moderate'}.</p>
                    </div>
                </div>
            \`;
        },
        
        related: function() {
            results.innerHTML = \`
                <h3>Related Content</h3>
                <div class="related-content">
                    <p>Finding stories related to: "\${'${this.story.title}'}"</p>
                    <div class="related-list">
                        <div class="related-item">
                            <h4>Similar Story #1</h4>
                            <p>A related discussion from yesterday...</p>
                            <span class="related-score">45 points</span>
                        </div>
                        <div class="related-item">
                            <h4>Similar Story #2</h4>
                            <p>Another perspective on the same topic...</p>
                            <span class="related-score">78 points</span>
                        </div>
                        <div class="related-item">
                            <h4>Similar Story #3</h4>
                            <p>Follow-up discussion thread...</p>
                            <span class="related-score">32 points</span>
                        </div>
                    </div>
                </div>
            \`;
        }
    };
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.id;
            if (actions[action]) {
                actions[action]();
                results.classList.add('animated');
                setTimeout(() => results.classList.remove('animated'), 600);
            }
        });
    });
});

// Add CSS for the interactive elements
const style = document.createElement('style');
style.textContent = \`
    .loading-dots span {
        animation: loading 1.4s infinite;
    }
    .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
    .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes loading {
        0%, 60%, 100% { opacity: 0; }
        30% { opacity: 1; }
    }
    
    .metric {
        display: flex;
        align-items: center;
        gap: 15px;
        margin: 15px 0;
    }
    
    .label {
        min-width: 120px;
        font-weight: 600;
    }
    
    .bar {
        flex: 1;
        height: 20px;
        background: #e0e0e0;
        border-radius: 10px;
        overflow: hidden;
    }
    
    .fill {
        height: 100%;
        background: linear-gradient(90deg, #4ecdc4, #44a08d);
        transition: width 1s ease;
    }
    
    .related-item {
        background: #f8f9fa;
        padding: 15px;
        margin: 10px 0;
        border-radius: 10px;
        border-left: 4px solid #4ecdc4;
    }
    
    .related-score {
        color: #666;
        font-size: 0.9rem;
    }
\`;
document.head.appendChild(style);`;
        }
    }
    
    getContentType() {
        const title = this.story.title.toLowerCase();
        
        if (title.includes('data') || title.includes('chart') || title.includes('graph') || title.includes('visualization')) {
            return 'data-visualization';
        } else if (title.includes('demo') || title.includes('app') || title.includes('tool') || title.includes('interactive')) {
            return 'interactive-demo';
        } else {
            return 'article-analysis';
        }
    }
    
    getComplexity() {
        return this.story.score > 200 ? 'High' : this.story.score > 50 ? 'Medium' : 'Low';
    }
    
    getRecommendedUI() {
        const contentType = this.getContentType();
        if (contentType === 'data-visualization') return 'Interactive Charts & Graphs';
        if (contentType === 'interactive-demo') return 'Feature Showcase with Live Demo';
        return 'Content Analysis Dashboard';
    }
    
    renderBuildSteps() {
        const container = document.getElementById('buildSteps');
        container.innerHTML = this.buildSteps.map(step => `
            <div class="build-step ${step.status}">
                <div class="step-icon">${step.icon}</div>
                <div class="step-text">${step.text}</div>
            </div>
        `).join('');
    }
    
    renderCodePanel(title, content, icon) {
        const container = document.getElementById('codePanels');
        
        const panel = document.createElement('div');
        panel.className = 'code-panel';
        panel.innerHTML = `
            <div class="code-header">
                <span>${icon}</span>
                <span>${title}</span>
            </div>
            <div class="code-content typing-animation">${this.escapeHtml(content)}</div>
        `;
        
        container.appendChild(panel);
        
        // Animate the typing effect
        const codeContent = panel.querySelector('.code-content');
        codeContent.style.width = '0';
        setTimeout(() => {
            codeContent.style.width = '100%';
        }, 100);
    }
    
    renderError(errorMessage) {
        const container = document.getElementById('codePanels');
        
        const errorPanel = document.createElement('div');
        errorPanel.className = 'error-message';
        errorPanel.textContent = `Error: ${errorMessage}`;
        
        container.appendChild(errorPanel);
        
        setTimeout(() => {
            errorPanel.remove();
        }, 3000);
    }
    
    renderPreview() {
        const iframe = document.getElementById('previewFrame');
        
        const fullHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>${this.generatedCode.css}</style>
            </head>
            <body>
                ${this.generatedCode.html.replace(/<!DOCTYPE html>.*?<body>/s, '').replace(/<\/body>.*?<\/html>/s, '')}
                <script>${this.generatedCode.javascript}</script>
            </body>
            </html>
        `;
        
        iframe.srcdoc = fullHTML;
    }
    
    updateStatus(message) {
        const statusText = document.querySelector('.status-text');
        statusText.textContent = message;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application
new HackerNewsAI();

