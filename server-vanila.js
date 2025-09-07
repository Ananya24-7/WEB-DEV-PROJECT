 // Simple server to serve our vanilla HTML/CSS/JS LifeOS version
 import express from 'express';
 import path from 'path';
 import { fileURLToPath } from 'url';
 import { dirname } from 'path';

 const __filename = fileURLToPath(
     import.meta.url);
 const __dirname = dirname(__filename);

 const app = express();
 const PORT = 8080; // Different port to avoid conflicts

 // Serve static files from current directory
 app.use(express.static(__dirname));

 // Serve the main HTML file for all routes
 app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, 'index.html'));
 });

 app.listen(PORT, () => {
     console.log('🚀 LifeOS Vanilla Version running on http://localhost:' + PORT);
     console.log('📱 Access your AI-powered productivity dashboard');
     console.log('👤 User: Ananya');
     console.log('🛠️ Tech: HTML + CSS + JavaScript + Local Storage');
 });