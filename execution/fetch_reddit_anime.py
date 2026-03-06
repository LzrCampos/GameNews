import urllib.request
import json
import os
from logger import get_logger

logger = get_logger('fetch_reddit_anime')

def fetch_reddit_posts(subreddit, limit=100):
    url = f"https://www.reddit.com/r/{subreddit}/new.json?limit={limit}"
    
    # Reddit API requires a custom User-Agent. Using a standard browser one usually works for unauthenticated JSON requests.
    req = urllib.request.Request(
        url, 
        data=None, 
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AgentScript/1.0'
        }
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data.get('data', {}).get('children', [])
    except Exception as e:
        logger.error(f"Error fetching data from Reddit: {e}")
        return []

def main():
    logger.info("Fetching recent anime posts from Reddit...")
    posts = fetch_reddit_posts('anime', 100)
    
    if not posts:
        logger.warning("No posts found or an error occurred.")
        return
        
    extracted_data = []
    for post in posts:
        post_data = post.get('data', {})
        
        # Try finding an image URL
        image_url = None
        
        # 1. Preview images (highest quality usually)
        if 'preview' in post_data and 'images' in post_data['preview'] and len(post_data['preview']['images']) > 0:
            image_url = post_data['preview']['images'][0].get('source', {}).get('url', '')
            image_url = image_url.replace('&amp;', '&')
        # 2. Direct link to image
        elif post_data.get('url', '').endswith(('.jpg', '.jpeg', '.png', '.gif')):
            image_url = post_data.get('url')
        # 3. Thumbnail extraction
        elif post_data.get('thumbnail', '').startswith('http'):
            image_url = post_data.get('thumbnail')
            
        extracted_data.append({
            'title': post_data.get('title'),
            'author': post_data.get('author'),
            'url': post_data.get('url'),
            'image_url': image_url,
            'created_utc': post_data.get('created_utc'),
            'score': post_data.get('score'),
            'num_comments': post_data.get('num_comments'),
            'selftext': post_data.get('selftext', '')[:200]
        })
        
    logger.info(f"Successfully fetched {len(extracted_data)} posts.")
    
    # Save to the .tmp folder dynamically based on current file location
    output_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.tmp', 'anime_posts.json')
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(extracted_data, f, indent=4, ensure_ascii=False)
        logger.info(f"Data successfully saved to {output_path}")
    except Exception as e:
        logger.error(f"Error writing to file: {e}")

if __name__ == "__main__":
    main()
