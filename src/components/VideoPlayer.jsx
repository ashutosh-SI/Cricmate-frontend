import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/themes/dist/city/index.css';
import './VideoPlayer.css';

const VideoPlayer = ({ url }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      playerRef.current = videojs(videoRef.current, {
        autoplay: false,
        controls: true,
        preload: 'metadata',
        width: '100%',
        height: 'auto',
        bigPlayButton: true,
        sources: [
          {
            src: url,
            type: 'video/mp4',
          },
        ],
      });
    }
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [url]);

  return (
    <div data-vjs-player>
      <video
        ref={videoRef}
        className="video-js vjs-theme-city vjs-big-play-centered"
      />
    </div>
  );
};

export default VideoPlayer;