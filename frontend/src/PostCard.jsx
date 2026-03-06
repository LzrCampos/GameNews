import React from 'react';
import {
  MessageSquare,
  ThumbsUp,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';

const PostCard = ({ post }) => {
  // Format the Unix timestamp to a readable date
  const formatDate = (utcTime) => {
    if (!utcTime) return 'Unknown date';
    const date = new Date(utcTime * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`post-card ${!post.image_url ? 'compact-card' : ''}`} onClick={() => window.open(post.url, '_blank')}
      style={{ gridRowEnd: !post.image_url ? 'span 1' : 'span 2' }}>
      {post.image_url && (
        <div className="card-image-container" style={{
          width: '100%',
          height: '140px',
          borderRadius: '12px',
          marginBottom: '1rem',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid var(--border-glass)'
        }}>
          <img
            src={post.image_url}
            alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextElementSibling) {
                e.target.nextElementSibling.style.display = 'flex';
              }
            }}
          />
          <div className="card-image-placeholder error-fallback" style={{ display: 'none', margin: 0, height: '100%', position: 'absolute', top: 0, left: 0, width: '100%' }}>
            <ImageIcon size={32} color="rgba(75, 123, 255, 0.4)" />
          </div>
        </div>
      )}

      <h3 className="post-title">{post.title}</h3>

      <p className="post-content">
        {post.selftext ? post.selftext : "This post contains an image, video, or external link. Click to view on Reddit."}
      </p>

      <div className="post-meta">
        <div className="meta-item">
          <span style={{ color: 'var(--accent-blue)' }}>u/{post.author}</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="meta-item">
            <ThumbsUp size={14} />
            <span>{post.score || 0}</span>
          </div>
          <div className="meta-item">
            <MessageSquare size={14} />
            <span>{post.num_comments || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
