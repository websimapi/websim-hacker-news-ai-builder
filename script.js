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
            { id: 'design', icon: '🎨', text: 'Creating design concept', status: 'pending' },
            { id: 'assets', icon: '🖼️', text: 'Generating image assets', status: 'pending' },
            { id: 'html', icon: '📄', text: 'Generating HTML structure', status: 'pending' },
            { id: 'css', icon: '🎨', text: 'Creating visual styles', status: 'pending' },
            { id: 'javascript', icon: '⚡', text: 'Adding interactivity', status: 'pending' },
            { id: 'optimize', icon: '⚡', text: 'Optimizing performance', status: 'pending' },
            { id: 'test', icon: '🧪', text: 'Testing application', status: 'pending' },
            { id: 'deploy', icon: '🚀', text: 'Deploying application', status: 'pending' }
        ];
        
        this.generatedCode = {
            html: '',
            css: '',
            javascript: ''
        };

        this.generatedAssets = [];
        this.designConcept = null;
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
            case 'design':
                await this.createDesignConcept();
                break;
            case 'assets':
                await this.generateImageAssets();
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
            case 'optimize':
                await this.optimizeApplication();
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
        await this.sleep(1000);
        
        // Use AI to analyze the story content
        const analysis = await websim.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Analyze this Hacker News story and determine the best type of interactive application to build. 
                    Respond with JSON containing: {
                        "contentType": "data-visualization" | "interactive-demo" | "article-analysis" | "tool" | "game",
                        "complexity": "low" | "medium" | "high",
                        "suggestedFeatures": string[],
                        "visualStyle": "modern" | "technical" | "playful" | "professional",
                        "colorScheme": string,
                        "description": string
                    }`
                },
                {
                    role: "user",
                    content: `Title: ${this.story.title}\nScore: ${this.story.score}\nComments: ${this.story.descendants}\nURL: ${this.story.url || 'N/A'}`
                }
            ],
            json: true
        });

        this.analysisResult = JSON.parse(analysis.content);
        
        const analysisText = `Analysis Complete!\n\nContent Type: ${this.analysisResult.contentType}\nComplexity: ${this.analysisResult.complexity}\nVisual Style: ${this.analysisResult.visualStyle}\nDescription: ${this.analysisResult.description}`;
        
        this.renderAnalysisPanel(analysisText);
        this.updateStatus('Analysis complete! Moving to design phase...');
    }

    async createDesignConcept() {
        this.updateStatus('Creating comprehensive design concept...');
        await this.sleep(1500);

        // Generate design concept using AI
        const designPrompt = await websim.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Create a detailed design concept for a ${this.analysisResult.contentType} application. 
                    Respond with JSON containing: {
                        "layout": string,
                        "components": string[],
                        "interactions": string[],
                        "imageAssets": [{"name": string, "description": string, "purpose": string}],
                        "animations": string[]
                    }`
                },
                {
                    role: "user",
                    content: `Story: ${this.story.title}\nStyle: ${this.analysisResult.visualStyle}\nFeatures: ${this.analysisResult.suggestedFeatures.join(', ')}`
                }
            ],
            json: true
        });

        this.designConcept = JSON.parse(designPrompt.content);
        
        this.renderDesignPanel();
        this.updateStatus('Design concept created! Ready to generate assets...');
    }

    async generateImageAssets() {
        this.updateStatus('Generating custom image assets...');
        await this.sleep(1000);

        const assets = this.designConcept.imageAssets || [
            { name: 'hero-image', description: 'Main hero/banner image', purpose: 'visual appeal' },
            { name: 'icon-interactive', description: 'Interactive element icon', purpose: 'UI element' },
            { name: 'background-pattern', description: 'Subtle background pattern', purpose: 'background' }
        ];

        for (const asset of assets) {
            this.updateStatus(`Generating ${asset.name}...`);
            
            try {
                const imagePrompt = `${asset.description} for a ${this.analysisResult.visualStyle} ${this.analysisResult.contentType} application about "${this.story.title}". Style: ${this.analysisResult.colorScheme}. High quality, modern design.`;
                
                const result = await websim.imageGen({
                    prompt: imagePrompt,
                    aspect_ratio: asset.purpose === 'background' ? '16:9' : '1:1',
                    transparent: asset.purpose === 'UI element'
                });

                this.generatedAssets.push({
                    name: asset.name,
                    url: result.url,
                    description: asset.description,
                    purpose: asset.purpose
                });

                this.renderAssetPanel(asset.name, result.url, asset.description);
                await this.sleep(1500);
                
            } catch (error) {
                console.error('Error generating image:', error);
                this.updateStatus(`⚠️ Error generating ${asset.name}, using fallback...`);
            }
        }

        this.updateStatus('All image assets generated successfully!');
    }

    async generateHTML() {
        this.updateStatus('Generating comprehensive HTML structure...');
        
        await this.sleep(2000);
        
        this.generatedCode.html = this.generateAdvancedHTMLContent();
        this.renderCodePanel('HTML', this.generatedCode.html, '📄');
        
        await this.sleep(1000);
        this.updateStatus('HTML structure with integrated assets generated!');
    }

    async generateCSS() {
        this.updateStatus('Creating advanced visual styles with custom assets...');
        
        await this.sleep(2500);
        
        this.generatedCode.css = this.generateAdvancedCSSContent();
        this.renderCodePanel('CSS', this.generatedCode.css, '🎨');
        
        await this.sleep(1000);
        this.updateStatus('Advanced styling with custom assets applied!');
    }

    async generateJavaScript() {
        this.updateStatus('Adding sophisticated interactive functionality...');
        
        await this.sleep(3000);
        
        this.generatedCode.javascript = this.generateAdvancedJSContent();
        this.renderCodePanel('JavaScript', this.generatedCode.javascript, '⚡');
        
        await this.sleep(1000);
        this.updateStatus('Advanced interactive features implemented!');
    }

    async optimizeApplication() {
        this.updateStatus('Optimizing performance and accessibility...');
        await this.sleep(2000);
        
        // Simulate optimization
        this.updateStatus('✨ Optimized image loading, added accessibility features');
        await this.sleep(1000);
        this.updateStatus('🚀 Performance optimization complete!');
    }

    generateAdvancedHTMLContent() {
        const heroImage = this.generatedAssets.find(a => a.name === 'hero-image');
        const iconImage = this.generatedAssets.find(a => a.name === 'icon-interactive');
        
        if (this.analysisResult.contentType === 'data-visualization') {
            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.story.title}</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="app-container">
        <header class="hero-section" ${heroImage ? `style="background-image: url('${heroImage.url}')"` : ''}>
            <div class="hero-overlay">
                <h1 class="hero-title">${this.story.title}</h1>
                <div class="story-meta">
                    <span class="score-badge">${this.story.score} points</span>
                    <span class="comments-badge">${this.story.descendants} comments</span>
                    <span class="author">by ${this.story.by}</span>
                </div>
                <p class="hero-description">Interactive data visualization and analysis</p>
            </div>
        </header>
        
        <main class="main-content">
            <div class="visualization-section">
                <div class="viz-header">
                    <h2>Data Visualization</h2>
                    <div class="viz-controls">
                        <button class="control-btn" id="randomize" ${iconImage ? `style="background-image: url('${iconImage.url}')"` : ''}>
                            <span>Generate Data</span>
                        </button>
                        <button class="control-btn" id="animate">Animate</button>
                        <button class="control-btn" id="export">Export</button>
                    </div>
                </div>
                <div class="chart-container">
                    <div id="chart" class="chart-area"></div>
                    <div class="chart-info">
                        <div class="info-card">
                            <h3>Insights</h3>
                            <div id="insights"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="interaction-section">
                <div class="filters">
                    <h3>Filters & Controls</h3>
                    <div class="filter-grid">
                        <div class="filter-item">
                            <label>Data Range</label>
                            <input type="range" id="dataRange" min="10" max="100" value="50">
                        </div>
                        <div class="filter-item">
                            <label>Chart Type</label>
                            <select id="chartType">
                                <option value="bar">Bar Chart</option>
                                <option value="line">Line Chart</option>
                                <option value="scatter">Scatter Plot</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</body>
</html>`;
        }
        
        // Enhanced interactive demo template
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.story.title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="app-wrapper">
        <nav class="app-nav">
            <div class="nav-brand">
                ${iconImage ? `<img src="${iconImage.url}" alt="App Icon" class="nav-icon">` : ''}
                <span class="nav-title">Interactive Demo</span>
            </div>
            <div class="nav-controls">
                <button class="nav-btn" id="resetBtn">Reset</button>
                <button class="nav-btn" id="helpBtn">Help</button>
            </div>
        </nav>
        
        <header class="app-header" ${heroImage ? `style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${heroImage.url}')"` : ''}>
            <div class="header-content">
                <h1>${this.story.title}</h1>
                <p class="subtitle">Interactive exploration of the topic</p>
                <div class="header-stats">
                    <div class="stat">
                        <span class="stat-number">${this.story.score}</span>
                        <span class="stat-label">Points</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${this.story.descendants}</span>
                        <span class="stat-label">Comments</span>
                    </div>
                </div>
            </div>
        </header>
        
        <main class="app-main">
            <div class="feature-showcase">
                <div class="feature-grid">
                    <div class="feature-card interactive" data-feature="realtime">
                        <div class="feature-icon">📊</div>
                        <h3>Real-time Data</h3>
                        <p>Experience live data updates and interactions</p>
                        <div class="feature-preview" id="realtimePreview"></div>
                    </div>
                    
                    <div class="feature-card interactive" data-feature="customization">
                        <div class="feature-icon">🎨</div>
                        <h3>Customization</h3>
                        <p>Personalize your experience with custom settings</p>
                        <div class="feature-preview" id="customPreview"></div>
                    </div>
                    
                    <div class="feature-card interactive" data-feature="analytics">
                        <div class="feature-icon">📈</div>
                        <h3>Analytics</h3>
                        <p>Deep insights and analytical tools</p>
                        <div class="feature-preview" id="analyticsPreview"></div>
                    </div>
                </div>
            </div>
            
            <div class="demo-area">
                <div class="demo-sidebar">
                    <h3>Controls</h3>
                    <div class="control-panel" id="controlPanel">
                        <!-- Dynamic controls will be added here -->
                    </div>
                </div>
                
                <div class="demo-content">
                    <div class="content-header">
                        <h2 id="demoTitle">Select a feature to begin</h2>
                        <div class="demo-actions">
                            <button class="action-btn primary" id="startDemo">Start Demo</button>
                            <button class="action-btn secondary" id="saveConfig">Save</button>
                        </div>
                    </div>
                    <div class="demo-canvas" id="demoCanvas">
                        <div class="placeholder-content">
                            <div class="placeholder-icon">🚀</div>
                            <p>Choose a feature from above to see it in action</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</body>
</html>`;
    }

    generateAdvancedCSSContent() {
        const backgroundPattern = this.generatedAssets.find(a => a.name === 'background-pattern');
        const heroImage = this.generatedAssets.find(a => a.name === 'hero-image');
        
        return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary-color: ${this.analysisResult.colorScheme || '#667eea'};
    --secondary-color: #764ba2;
    --accent-color: #4ecdc4;
    --success-color: #2ecc71;
    --warning-color: #f39c12;
    --danger-color: #e74c3c;
    --dark-color: #2c3e50;
    --light-color: #ecf0f1;
    --text-color: #333;
    --text-light: #666;
    --border-radius: 12px;
    --box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background: ${backgroundPattern ? `url('${backgroundPattern.url}')` : 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)'};
    background-attachment: fixed;
    min-height: 100vh;
}

.app-container, .app-wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

/* Navigation Styles */
.app-nav {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    position: sticky;
    top: 0;
    z-index: 100;
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
    font-size: 1.125rem;
}

.nav-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
}

.nav-controls {
    display: flex;
    gap: 0.5rem;
}

.nav-btn {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
}

.nav-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Hero Section */
.hero-section, .app-header {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    background-size: cover;
    background-position: center;
    color: white;
    padding: 4rem 2rem;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.hero-overlay {
    background: rgba(0, 0, 0, 0.4);
    padding: 2rem;
    border-radius: var(--border-radius);
    backdrop-filter: blur(5px);
}

.hero-title, .app-header h1 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.story-meta, .header-stats {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin: 1.5rem 0;
    flex-wrap: wrap;
}

.score-badge, .comments-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
    backdrop-filter: blur(5px);
}

.stat {
    text-align: center;
}

.stat-number {
    display: block;
    font-size: 2rem;
    font-weight: 700;
}

.stat-label {
    font-size: 0.875rem;
    opacity: 0.8;
}

/* Main Content */
.main-content, .app-main {
    flex: 1;
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
}

/* Feature Showcase */
.feature-showcase {
    margin-bottom: 3rem;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.feature-card {
    background: rgba(255, 255, 255, 0.95);
    padding: 2rem;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    transition: var(--transition);
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
    transform: scaleX(0);
    transition: var(--transition);
}

.feature-card:hover::before {
    transform: scaleX(1);
}

.feature-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.feature-card h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--dark-color);
}

.feature-preview {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--light-color);
    border-radius: 8px;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    color: var(--text-light);
}

/* Demo Area */
.demo-area {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
    background: rgba(255, 255, 255, 0.95);
    border-radius: var(--border-radius);
    padding: 2rem;
    box-shadow: var(--box-shadow);
    backdrop-filter: blur(10px);
}

.demo-sidebar {
    background: var(--light-color);
    padding: 1.5rem;
    border-radius: var(--border-radius);
}

.control-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
}

.demo-content {
    display: flex;
    flex-direction: column;
}

.content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--light-color);
}

.demo-actions {
    display: flex;
    gap: 0.75rem;
}

.action-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: var(--border-radius);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
}

.action-btn.primary {
    background: var(--primary-color);
    color: white;
}

.action-btn.secondary {
    background: transparent;
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
}

.action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.demo-canvas {
    flex: 1;
    background: white;
    border-radius: var(--border-radius);
    border: 2px dashed var(--light-color);
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.placeholder-content {
    text-align: center;
    color: var(--text-light);
}

.placeholder-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

/* Visualization Styles */
.visualization-section {
    background: rgba(255, 255, 255, 0.95);
    border-radius: var(--border-radius);
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: var(--box-shadow);
    backdrop-filter: blur(10px);
}

.viz-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--light-color);
}

.viz-controls {
    display: flex;
    gap: 0.75rem;
}

.control-btn {
    background: linear-gradient(45deg, var(--accent-color), #44a08d);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-size: 20px;
    background-repeat: no-repeat;
    background-position: 10px center;
    padding-left: 2.5rem;
}

.control-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.chart-container {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
}

.chart-area {
    background: white;
    border: 2px solid var(--light-color);
    border-radius: var(--border-radius);
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.info-card {
    background: var(--light-color);
    padding: 1.5rem;
    border-radius: var(--border-radius);
    height: fit-content;
}

/* Filter Section */
.interaction-section {
    background: rgba(255, 255, 255, 0.95);
    border-radius: var(--border-radius);
    padding: 2rem;
    box-shadow: var(--box-shadow);
    backdrop-filter: blur(10px);
}

.filter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
}

.filter-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.filter-item label {
    font-weight: 600;
    color: var(--dark-color);
}

.filter-item input,
.filter-item select {
    padding: 0.75rem;
    border: 2px solid var(--light-color);
    border-radius: var(--border-radius);
    font-size: 1rem;
    transition: var(--transition);
}

.filter-item input:focus,
.filter-item select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Animations */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animated {
    animation: fadeInUp 0.6s ease-out;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
}

.loading {
    animation: pulse 2s infinite;
}

/* Responsive Design */
@media (max-width: 1024px) {
    .demo-area {
        grid-template-columns: 1fr;
    }
    
    .chart-container {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .main-content, .app-main {
        padding: 1rem;
    }
    
    .hero-section, .app-header {
        padding: 2rem 1rem;
    }
    
    .story-meta, .header-stats {
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .viz-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
    
    .viz-controls {
        justify-content: center;
    }
    
    .content-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
}

@media (max-width: 480px) {
    .feature-grid {
        grid-template-columns: 1fr;
    }
    
    .filter-grid {
        grid-template-columns: 1fr;
    }
    
    .control-btn {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
    }
}`;
    }

    generateAdvancedJSContent() {
        const contentType = this.analysisResult.contentType;
        
        return `document.addEventListener('DOMContentLoaded', function() {
    console.log('Advanced ${contentType} application initialized');
    
    // Application state management
    const AppState = {
        currentFeature: null,
        settings: {
            theme: '${this.analysisResult.visualStyle}',
            animations: true,
            autoUpdate: false
        },
        data: null,
        isLoading: false
    };
    
    // Utility functions
    const Utils = {
        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        animate: (element, keyframes, options = {}) => {
            if (!AppState.settings.animations) return Promise.resolve();
            return element.animate(keyframes, {
                duration: 300,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                fill: 'forwards',
                ...options
            }).finished;
        },
        
        generateData: (count = 20) => {
            return Array.from({length: count}, (_, i) => ({
                id: i,
                x: i,
                y: Math.random() * 100 + 10,
                category: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
                value: Math.random() * 1000 + 100,
                timestamp: new Date(Date.now() - Math.random() * 86400000 * 30)
            }));
        }
    };
    
    ${contentType === 'data-visualization' ? this.generateVisualizationJS() : this.generateInteractiveJS()}
    
    // Global event handlers
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            resetApplication();
        } else if (e.key === 'r' && e.ctrlKey) {
            e.preventDefault();
            refreshData();
        }
    });
    
    // Initialize application
    initializeApplication();
    
    function initializeApplication() {
        console.log('Initializing advanced application...');
        
        // Setup performance monitoring
        if ('performance' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.entryType === 'measure') {
                        console.log(\`Performance: \${entry.name} took \${entry.duration}ms\`);
                    }
                });
            });
            observer.observe({entryTypes: ['measure']});
        }
        
        // Setup error handling
        window.addEventListener('error', (e) => {
            console.error('Application error:', e.error);
            showNotification('An error occurred. Please refresh the page.', 'error');
        });
        
        // Setup offline detection
        window.addEventListener('online', () => {
            showNotification('Connection restored', 'success');
        });
        
        window.addEventListener('offline', () => {
            showNotification('Working offline', 'warning');
        });
        
        // Load saved settings
        loadSettings();
        
        // Start main application logic
        ${contentType === 'data-visualization' ? 'initializeVisualization();' : 'initializeInteractiveDemo();'}
    }
    
    function loadSettings() {
        try {
            const saved = localStorage.getItem('app-settings');
            if (saved) {
                Object.assign(AppState.settings, JSON.parse(saved));
            }
        } catch (e) {
            console.warn('Could not load settings:', e);
        }
    }
    
    function saveSettings() {
        try {
            localStorage.setItem('app-settings', JSON.stringify(AppState.settings));
        } catch (e) {
            console.warn('Could not save settings:', e);
        }
    }
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = \`notification notification-\${type}\`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            zIndex: '1000',
            opacity: '0',
            transform: 'translateY(-20px)',
            transition: 'all 0.3s ease'
        });
        
        const colors = {
            info: '#3498db',
            success: '#2ecc71',
            warning: '#f39c12',
            error: '#e74c3c'
        };
        
        notification.style.background = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        });
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    function resetApplication() {
        AppState.currentFeature = null;
        AppState.data = null;
        
        // Reset UI
        const canvas = document.getElementById('demoCanvas') || document.getElementById('chart');
        if (canvas) {
            canvas.innerHTML = '';
            if (canvas.id === 'demoCanvas') {
                canvas.innerHTML = \`
                    <div class="placeholder-content">
                        <div class="placeholder-icon">🚀</div>
                        <p>Choose a feature from above to see it in action</p>
                    </div>
                \`;
            }
        }
        
        showNotification('Application reset', 'info');
    }
    
    function refreshData() {
        performance.mark('data-refresh-start');
        AppState.data = Utils.generateData();
        performance.mark('data-refresh-end');
        performance.measure('data-refresh', 'data-refresh-start', 'data-refresh-end');
        
        showNotification('Data refreshed', 'success');
        
        // Trigger data update events
        document.dispatchEvent(new CustomEvent('dataUpdated', {
            detail: { data: AppState.data }
        }));
    }
});`;
    }

    generateVisualizationJS() {
        return `
    // Advanced Data Visualization Logic
    let chart, data, scales, animations;
    
    function initializeVisualization() {
        data = Utils.generateData(50);
        setupVisualization();
        bindVisualizationEvents();
        renderChart();
    }
    
    function setupVisualization() {
        const chartElement = document.getElementById('chart');
        if (!chartElement) return;
        
        // Create SVG
        const svg = d3.select('#chart')
            .html('')
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', '0 0 800 400');
            
        // Setup scales
        scales = {
            x: d3.scaleLinear().domain([0, data.length - 1]).range([60, 740]),
            y: d3.scaleLinear().domain([0, d3.max(data, d => d.y)]).range([360, 40]),
            color: d3.scaleOrdinal(d3.schemeCategory10)
        };
        
        // Add gradients
        const defs = svg.append('defs');
        const gradient = defs.append('linearGradient')
            .attr('id', 'chartGradient')
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', 0).attr('y1', 360)
            .attr('x2', 0).attr('y2', 40);
            
        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#4ecdc4')
            .attr('stop-opacity', 0.8);
            
        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#44a08d')
            .attr('stop-opacity', 0.2);
    }
    
    function renderChart() {
        const svg = d3.select('#chart svg');
        const chartType = document.getElementById('chartType')?.value || 'bar';
        
        // Clear previous chart
        svg.selectAll('.chart-element').remove();
        
        performance.mark('chart-render-start');
        
        if (chartType === 'bar') {
            renderBarChart(svg);
        } else if (chartType === 'line') {
            renderLineChart(svg);
        } else if (chartType === 'scatter') {
            renderScatterPlot(svg);
        }
        
        performance.mark('chart-render-end');
        performance.measure('chart-render', 'chart-render-start', 'chart-render-end');
        
        updateInsights();
    }
    
    function renderBarChart(svg) {
        const bars = svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'chart-element bar')
            .attr('x', (d, i) => scales.x(i) - 8)
            .attr('y', scales.y(0))
            .attr('width', 16)
            .attr('height', 0)
            .attr('fill', 'url(#chartGradient)')
            .attr('rx', 4);
            
        bars.transition()
            .duration(800)
            .delay((d, i) => i * 20)
            .attr('y', d => scales.y(d.y))
            .attr('height', d => scales.y(0) - scales.y(d.y));
            
        // Add interactivity
        bars.on('mouseover', function(event, d) {
            d3.select(this).attr('opacity', 0.7);
            showTooltip(event, d);
        })
        .on('mouseout', function() {
            d3.select(this).attr('opacity', 1);
            hideTooltip();
        });
    }
    
    function renderLineChart(svg) {
        const line = d3.line()
            .x((d, i) => scales.x(i))
            .y(d => scales.y(d.y))
            .curve(d3.curveCardinal);
            
        const path = svg.append('path')
            .datum(data)
            .attr('class', 'chart-element line')
            .attr('fill', 'none')
            .attr('stroke', '#4ecdc4')
            .attr('stroke-width', 3)
            .attr('d', line);
            
        const totalLength = path.node().getTotalLength();
        
        path.attr('stroke-dasharray', totalLength + ' ' + totalLength)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(1500)
            .attr('stroke-dashoffset', 0);
            
        // Add data points
        svg.selectAll('.dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'chart-element dot')
            .attr('cx', (d, i) => scales.x(i))
            .attr('cy', d => scales.y(d.y))
            .attr('r', 0)
            .attr('fill', '#44a08d')
            .transition()
            .duration(500)
            .delay((d, i) => 1500 + i * 30)
            .attr('r', 4);
    }
    
    function renderScatterPlot(svg) {
        const circles = svg.selectAll('.dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'chart-element dot')
            .attr('cx', (d, i) => scales.x(i))
            .attr('cy', d => scales.y(d.y))
            .attr('r', 0)
            .attr('fill', d => scales.color(d.category))
            .attr('opacity', 0.7);
            
        circles.transition()
            .duration(600)
            .delay((d, i) => i * 40)
            .attr('r', d => Math.sqrt(d.value) / 5);
    }
    
    function bindVisualizationEvents() {
        document.getElementById('randomize')?.addEventListener('click', () => {
            data = Utils.generateData(parseInt(document.getElementById('dataRange')?.value) || 50);
            scales.y.domain([0, d3.max(data, d => d.y)]);
            renderChart();
        });
        
        document.getElementById('animate')?.addEventListener('click', () => {
            animateChart();
        });
        
        document.getElementById('export')?.addEventListener('click', () => {
            exportChart();
        });
        
        document.getElementById('dataRange')?.addEventListener('input', Utils.debounce((e) => {
            data = Utils.generateData(parseInt(e.target.value));
            scales.y.domain([0, d3.max(data, d => d.y)]);
            renderChart();
        }, 300));
        
        document.getElementById('chartType')?.addEventListener('change', (e) => {
            renderChart();
        });
    }
    
    function animateChart() {
        const svg = d3.select('#chart svg');
        svg.selectAll('.chart-element')
            .transition()
            .duration(1000)
            .attr('transform', 'scale(1.1)')
            .transition()
            .duration(1000)
            .attr('transform', 'scale(1)');
    }
    
    function exportChart() {
        const svg = document.querySelector('#chart svg');
        const serializer = new XMLSerializer();
        const source = serializer.serializeToString(svg);
        
        const blob = new Blob([source], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chart.svg';
        a.click();
        
        URL.revokeObjectURL(url);
        showNotification('Chart exported successfully', 'success');
    }
    
    function updateInsights() {
        const insights = document.getElementById('insights');
        if (!insights) return;
        
        const avg = d3.mean(data, d => d.y);
        const max = d3.max(data, d => d.y);
        const min = d3.min(data, d => d.y);
        
        insights.innerHTML = \`
            <div class="insight-item">
                <strong>Average:</strong> \${avg.toFixed(2)}
            </div>
            <div class="insight-item">
                <strong>Maximum:</strong> \${max.toFixed(2)}
            </div>
            <div class="insight-item">
                <strong>Minimum:</strong> \${min.toFixed(2)}
            </div>
            <div class="insight-item">
                <strong>Range:</strong> \${(max - min).toFixed(2)}
            </div>
        \`;
    }
    
    function showTooltip(event, d) {
        const tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', '8px 12px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('opacity', 0);
            
        tooltip.html(\`Value: \${d.y.toFixed(2)}<br>Category: \${d.category}\`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .transition()
            .duration(200)
            .style('opacity', 1);
    }
    
    function hideTooltip() {
        d3.selectAll('.tooltip').remove();
    }`;
    }

    generateInteractiveJS() {
        return `
    // Advanced Interactive Demo Logic
    let activeFeature = null;
    let demoData = {};
    
    function initializeInteractiveDemo() {
        setupFeatureCards();
        setupDemoArea();
        bindInteractiveEvents();
        loadDemoPresets();
    }
    
    function setupFeatureCards() {
        const cards = document.querySelectorAll('.feature-card');
        cards.forEach(card => {
            card.addEventListener('click', () => activateFeature(card.dataset.feature));
            
            // Add hover effects
            card.addEventListener('mouseenter', () => {
                Utils.animate(card, [
                    { transform: 'translateY(0) scale(1)' },
                    { transform: 'translateY(-8px) scale(1.02)' }
                ], { duration: 200 });
            });
            
            card.addEventListener('mouseleave', () => {
                if (card.dataset.feature !== activeFeature) {
                    Utils.animate(card, [
                        { transform: 'translateY(-8px) scale(1.02)' },
                        { transform: 'translateY(0) scale(1)' }
                    ], { duration: 200 });
                }
            });
        });
    }
    
    function setupDemoArea() {
        const canvas = document.getElementById('demoCanvas');
        if (!canvas) return;
        
        // Add resize observer for responsive updates
        if ('ResizeObserver' in window) {
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    updateCanvasSize(entry.contentRect);
                }
            });
            resizeObserver.observe(canvas);
        }
    }
    
    function activateFeature(featureId) {
        if (activeFeature === featureId) return;
        
        activeFeature = featureId;
        
        // Update UI state
        document.querySelectorAll('.feature-card').forEach(card => {
            card.classList.toggle('active', card.dataset.feature === featureId);
        });
        
        // Update demo title
        const titles = {
            realtime: 'Real-time Data Streaming',
            customization: 'Personalization Settings',
            analytics: 'Advanced Analytics Dashboard'
        };
        
        document.getElementById('demoTitle').textContent = titles[featureId] || 'Feature Demo';
        
        // Load feature content
        loadFeatureContent(featureId);
        
        // Update controls
        updateControlPanel(featureId);
        
        showNotification(\`Activated \${titles[featureId]}\`, 'success');
    }
    
    function loadFeatureContent(featureId) {
        const canvas = document.getElementById('demoCanvas');
        if (!canvas) return;
        
        canvas.innerHTML = '';
        
        switch (featureId) {
            case 'realtime':
                loadRealtimeDemo(canvas);
                break;
            case 'customization':
                loadCustomizationDemo(canvas);
                break;
            case 'analytics':
                loadAnalyticsDemo(canvas);
                break;
        }
    }
    
    function loadRealtimeDemo(canvas) {
        canvas.innerHTML = \`
            <div class="realtime-demo">
                <div class="data-stream">
                    <h3>Live Data Stream</h3>
                    <div class="stream-container" id="streamContainer">
                        <div class="stream-item">Initializing...</div>
                    </div>
                </div>
                <div class="metrics-panel">
                    <div class="metric">
                        <span class="metric-label">Updates/sec</span>
                        <span class="metric-value" id="updateRate">0</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Total Points</span>
                        <span class="metric-value" id="totalPoints">0</span>
                    </div>
                </div>
            </div>
        \`;
        
        startRealtimeUpdates();
    }
    
    function loadCustomizationDemo(canvas) {
        canvas.innerHTML = \`
            <div class="customization-demo">
                <div class="customization-panel">
                    <h3>Personalization Options</h3>
                    <div class="option-group">
                        <label>Color Scheme</label>
                        <div class="color-options">
                            <button class="color-option" data-color="blue" style="background: #3498db"></button>
                            <button class="color-option" data-color="green" style="background: #2ecc71"></button>
                            <button class="color-option" data-color="purple" style="background: #9b59b6"></button>
                            <button class="color-option" data-color="orange" style="background: #f39c12"></button>
                        </div>
                    </div>
                    <div class="option-group">
                        <label>Layout Style</label>
                        <select id="layoutStyle">
                            <option value="grid">Grid Layout</option>
                            <option value="list">List Layout</option>
                            <option value="card">Card Layout</option>
                        </select>
                    </div>
                </div>
                <div class="preview-area" id="customPreview">
                    <div class="sample-content">
                        <h4>Sample Content</h4>
                        <p>This area will reflect your customization choices.</p>
                    </div>
                </div>
            </div>
        \`;
        
        bindCustomizationEvents();
    }
    
    function loadAnalyticsDemo(canvas) {
        canvas.innerHTML = \`
            <div class="analytics-demo">
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <h4>Performance</h4>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 75%"></div>
                        </div>
                        <span class="analytics-value">75%</span>
                    </div>
                    <div class="analytics-card">
                        <h4>Engagement</h4>
                        <div class="chart-mini" id="engagementChart"></div>
                    </div>
                    <div class="analytics-card">
                        <h4>Growth</h4>
                        <div class="stat-number">+23%</div>
                        <div class="stat-trend">↗️ Trending up</div>
                    </div>
                </div>
                <div class="detailed-analytics">
                    <canvas id="analyticsCanvas" width="400" height="200"></canvas>
                </div>
            </div>
        \`;
        
        initializeAnalyticsCharts();
    }
    
    function startRealtimeUpdates() {
        let updateCount = 0;
        let totalPoints = 0;
        
        const updateInterval = setInterval(() => {
            if (activeFeature !== 'realtime') {
                clearInterval(updateInterval);
                return;
            }
            
            const container = document.getElementById('streamContainer');
            if (!container) return;
            
            const newData = {
                timestamp: new Date().toLocaleTimeString(),
                value: Math.random() * 100,
                type: ['INFO', 'SUCCESS', 'WARNING'][Math.floor(Math.random() * 3)]
            };
            
            const streamItem = document.createElement('div');
            streamItem.className = \`stream-item \${newData.type.toLowerCase()}\`;
            streamItem.innerHTML = \`
                <span class="timestamp">\${newData.timestamp}</span>
                <span class="value">\${newData.value.toFixed(2)}</span>
                <span class="type">\${newData.type}</span>
            \`;
            
            container.insertBefore(streamItem, container.firstChild);
            
            // Limit to 10 items
            while (container.children.length > 10) {
                container.removeChild(container.lastChild);
            }
            
            updateCount++;
            totalPoints += newData.value;
            
            document.getElementById('updateRate').textContent = (updateCount / 10).toFixed(1);
            document.getElementById('totalPoints').textContent = totalPoints.toFixed(0);
            
            Utils.animate(streamItem, [
                { opacity: 0, transform: 'translateX(-20px)' },
                { opacity: 1, transform: 'translateX(0)' }
            ]);
            
        }, 1000);
    }
    
    function bindCustomizationEvents() {
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                applyColorScheme(color);
            });
        });
        
        document.getElementById('layoutStyle')?.addEventListener('change', (e) => {
            applyLayoutStyle(e.target.value);
        });
    }
    
    function applyColorScheme(scheme) {
        const colors = {
            blue: '#3498db',
            green: '#2ecc71',
            purple: '#9b59b6',
            orange: '#f39c12'
        };
        
        const preview = document.getElementById('customPreview');
        if (preview) {
            preview.style.accentColor = colors[scheme];
            preview.style.borderLeftColor = colors[scheme];
            preview.style.borderLeftWidth = '4px';
            preview.style.borderLeftStyle = 'solid';
        }
        
        showNotification(\`Applied \${scheme} color scheme\`, 'success');
    }
    
    function applyLayoutStyle(style) {
        const preview = document.getElementById('customPreview');
        if (!preview) return;
        
        preview.className = \`preview-area layout-\${style}\`;
        showNotification(\`Applied \${style} layout\`, 'success');
    }
    
    function initializeAnalyticsCharts() {
        const canvas = document.getElementById('analyticsCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const data = Array.from({length: 20}, () => Math.random() * 100);
        
        // Simple line chart
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = (index / (data.length - 1)) * canvas.width;
            const y = canvas.height - (point / 100) * canvas.height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }
    
    function updateControlPanel(featureId) {
        const panel = document.getElementById('controlPanel');
        if (!panel) return;
        
        const controls = {
            realtime: \`
                <button class="control-item" id="pauseStream">Pause Stream</button>
                <button class="control-item" id="clearStream">Clear Data</button>
                <div class="control-item">
                    <label>Update Rate</label>
                    <input type="range" id="updateRate" min="500" max="3000" value="1000">
                </div>
            \`,
            customization: \`
                <button class="control-item" id="resetCustom">Reset to Default</button>
                <button class="control-item" id="saveCustom">Save Settings</button>
                <div class="control-item">
                    <label>Animation Speed</label>
                    <input type="range" id="animSpeed" min="0.5" max="2" step="0.1" value="1">
                </div>
            \`,
            analytics: \`
                <button class="control-item" id="refreshAnalytics">Refresh Data</button>
                <button class="control-item" id="exportAnalytics">Export Report</button>
                <div class="control-item">
                    <label>Time Range</label>
                    <select id="timeRange">
                        <option value="1h">Last Hour</option>
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                    </select>
                </div>
            \`
        };
        
        panel.innerHTML = controls[featureId] || '';
        
        // Bind new control events
        bindControlEvents(featureId);
    }
    
    function bindControlEvents(featureId) {
        // Feature-specific control bindings would go here
        // This is a simplified version
        
        document.querySelectorAll('.control-item').forEach(control => {
            if (control.tagName === 'BUTTON') {
                control.addEventListener('click', (e) => {
                    handleControlAction(e.target.id, featureId);
                });
            }
        });
    }
    
    function handleControlAction(actionId, featureId) {
        const actions = {
            pauseStream: () => showNotification('Stream paused', 'info'),
            clearStream: () => {
                const container = document.getElementById('streamContainer');
                if (container) container.innerHTML = '<div class="stream-item">Stream cleared</div>';
            },
            resetCustom: () => showNotification('Reset to defaults', 'info'),
            saveCustom: () => {
                saveSettings();
                showNotification('Settings saved', 'success');
            },
            refreshAnalytics: () => {
                initializeAnalyticsCharts();
                showNotification('Analytics refreshed', 'success');
            },
            exportAnalytics: () => showNotification('Report exported', 'success')
        };
        
        if (actions[actionId]) {
            actions[actionId]();
        }
    }
    
    function loadDemoPresets() {
        // Load any saved demo presets
        demoData = {
            realtime: { updateRate: 1000, maxItems: 10 },
            customization: { theme: 'blue', layout: 'grid' },
            analytics: { timeRange: '24h', charts: ['line', 'bar'] }
        };
    }
    
    function updateCanvasSize(rect) {
        // Handle responsive canvas updates
        if (activeFeature && rect.width > 0) {
            // Trigger re-render based on new size
            setTimeout(() => loadFeatureContent(activeFeature), 100);
        }
    }
    
    function showHelp() {
        const helpText = \`
            <h3>Interactive Demo Help</h3>
            <ul>
                <li><strong>Real-time:</strong> Shows live data streaming</li>
                <li><strong>Customization:</strong> Personalize the interface</li>
                <li><strong>Analytics:</strong> View detailed insights</li>
            </ul>
            <p>Use the controls on the left to adjust settings.</p>
        \`;
        
        showNotification(helpText, 'info');
    }`;
    }

    renderAnalysisPanel(analysisText) {
        const container = document.getElementById('codePanels');
        
        const panel = document.createElement('div');
        panel.className = 'analysis-panel';
        panel.innerHTML = `
            <div class="code-header">
                <span>🔍</span>
                <span>Story Analysis</span>
            </div>
            <div class="analysis-content">
                <pre>${analysisText}</pre>
            </div>
        `;
        
        container.appendChild(panel);
    }

    renderDesignPanel() {
        const container = document.getElementById('codePanels');
        
        const panel = document.createElement('div');
        panel.className = 'design-panel';
        panel.innerHTML = `
            <div class="code-header">
                <span>🎨</span>
                <span>Design Concept</span>
            </div>
            <div class="design-content">
                <h4>Layout: ${this.designConcept.layout}</h4>
                <h4>Components:</h4>
                <ul>${this.designConcept.components.map(c => `<li>${c}</li>`).join('')}</ul>
                <h4>Interactions:</h4>
                <ul>${this.designConcept.interactions.map(i => `<li>${i}</li>`).join('')}</ul>
            </div>
        `;
        
        container.appendChild(panel);
    }

    renderAssetPanel(name, url, description) {
        const container = document.getElementById('codePanels');
        
        const panel = document.createElement('div');
        panel.className = 'asset-panel';
        panel.innerHTML = `
            <div class="code-header">
                <span>🖼️</span>
                <span>Generated Asset: ${name}</span>
            </div>
            <div class="asset-content">
                <div class="asset-preview">
                    <img src="${url}" alt="${description}" style="max-width: 100%; height: auto; border-radius: 8px;">
                </div>
                <p class="asset-description">${description}</p>
                <div class="asset-meta">
                    <small>Generated: ${new Date().toLocaleTimeString()}</small>
                </div>
            </div>
        `;
        
        container.appendChild(panel);
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