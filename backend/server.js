const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json()); // Add JSON parser for POST bodies
const PORT = process.env.PORT || 3001;

// Allow the React frontend to make requests
app.use(cors());

// Path to the Python script workspace
const projectRoot = path.join(__dirname, '..');
const pythonScript = path.join(projectRoot, 'execution', 'fetch_reddit_anime.py');
const tmpDir = path.join(projectRoot, '.tmp');
const dataFile = path.join(tmpDir, 'anime_posts.json');

// Ensure tmp directory exists (needed for production deployments like Render)
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}

// HTML Email Template Generator
const generateEmailTemplate = (posts) => {
    const postsHtml = posts.map(post => `
        <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
            <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 16px;">${post.title}</h3>
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;"><strong>Likes:</strong> ${post.score} | <strong>Author:</strong> u/${post.author}</p>
            <a href="${post.url}" style="color: #4B7BFF; text-decoration: none; font-size: 14px; font-weight: bold;">Read on Reddit &rarr;</a>
        </div>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #E6EFFF; margin: 0; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
            .header-bar { padding: 30px 40px 10px; display: flex; align-items: center; }
            .logo { font-weight: 800; font-size: 18px; color: #1a1a1a; display: flex; align-items: center; gap: 8px;}
            .logo-icon { width: 16px; height: 16px; background-color: #4B7BFF; border-radius: 4px; display: inline-block; margin-right: 8px; }
            .content { padding: 20px 40px 40px; }
            .hero-title { font-size: 32px; font-weight: 800; color: #1a1a1a; margin: 0 0 10px 0; line-height: 1.2; }
            .hero-subtitle { font-size: 16px; color: #666; margin: 0 0 30px 0; }
            .primary-button { display: inline-block; background-color: #6C8DFF; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; margin-bottom: 40px; }
            .greeting { font-size: 14px; color: #1a1a1a; margin-bottom: 20px; font-weight: 500; }
            .body-text { font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 40px; }
            .feature-box { background: linear-gradient(135deg, #f8faff 0%, #eef3ff 100%); padding: 40px; text-align: center; border-radius: 8px; margin-bottom: 40px; border: 1px solid #e0e8ff; }
            .feature-title { font-size: 24px; font-weight: 800; color: #1a1a1a; margin: 0 0 10px 0; }
            .feature-subtitle { font-size: 14px; color: #666; margin: 0; }
            .footer { background-color: #6C8DFF; padding: 40px; text-align: center; color: white; }
            .footer p { margin: 0 0 10px 0; font-size: 12px; opacity: 0.9; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header-bar">
                <div class="logo"><span class="logo-icon"></span> AnimeDash</div>
            </div>
            <div class="content">
                <h1 class="hero-title">Top 5 Trending Posts</h1>
                <p class="hero-subtitle">Check out what the community is talking about today.</p>
                <a href="#" class="primary-button">View Full Dashboard</a>

                <div class="greeting">Hi Anime Fan,</div>
                <div class="body-text">
                    We've gathered the most highly-rated posts from r/anime just for you. 
                    Stay up-to-date with the latest discussions, fan art, and news from your favorite series.
                </div>

                <div style="margin-bottom: 40px">
                    ${postsHtml}
                </div>

                <div class="feature-box">
                    <h2 class="feature-title">Explore More Content</h2>
                    <p class="feature-subtitle">You will love the full experience on our platform.</p>
                </div>
            </div>
            <div class="footer">
                <p>Have a question? Contact us at support@animedash.local</p>
                <p>&copy; 2026 AnimeDash. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Endpoint to send the email
app.post('/api/send-email', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email address is required' });
    }

    try {
        // 1. Read the posts data
        const data = fs.readFileSync(dataFile, 'utf8');
        const allPosts = JSON.parse(data);

        // 2. Sort by likes (score) and get top 5
        const top5Posts = allPosts.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 5);

        // 3. Setup Nodemailer with Ethereal (Free testing SMTP service)
        // This avoids needing real Gmail/Sendgrid credentials for dev testing
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        // 4. Generate HTML and send
        const htmlContent = generateEmailTemplate(top5Posts);

        const info = await transporter.sendMail({
            from: '"AnimeDash Updates" <hello@animedash.local>',
            to: email,
            subject: "Your Top 5 Anime Posts 🌟",
            text: "Please view this email in an HTML client.",
            html: htmlContent,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", previewUrl);

        res.json({
            message: 'Email sent successfully!',
            previewUrl: previewUrl
        });

    } catch (error) {
        console.error("Failed to send email:", error);
        res.status(500).json({ error: 'Internal server error while sending email' });
    }
});

// Endpoint to trigger the data fetch action
app.post('/api/refresh', (req, res) => {
    console.log('Refresh requested. Executing python script...');

    exec(`python "${pythonScript}"`, { cwd: projectRoot }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error.message}`);
            return res.status(500).json({ error: 'Failed to execute extraction script.' });
        }

        console.log(`Script output: ${stdout}`);

        // Read the newly generated JSON file
        fs.readFile(dataFile, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading data file: ${err.message}`);
                return res.status(500).json({ error: 'Failed to read newly extracted data.' });
            }

            try {
                const posts = JSON.parse(data);
                res.json({ message: 'Refresh successful', posts: posts });
            } catch (parseError) {
                console.error(`Error parsing JSON: ${parseError.message}`);
                return res.status(500).json({ error: 'Invalid data format from extraction.' });
            }
        });
    });
});

app.listen(PORT, () => {
    console.log(`AnimeDash backend server running on http://localhost:${PORT}`);
});
