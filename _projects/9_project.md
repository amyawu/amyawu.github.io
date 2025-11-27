---
layout: page
title: Photography
description: 2022
img: assets/img/squirrel1_small.jpg
importance: 5
category: fun
---

<div class="instagram-grid">

  <div class="instagram-item">
    <img src="{{ '/assets/img/squirrel1_small.jpg' | relative_url }}" alt="Squirrel">
  </div>

  <div class="instagram-item">
    <img src="{{ '/assets/img/your_next_photo.jpg' | relative_url }}" alt="Photo 2">
  </div>
  
  <div class="instagram-item">
    <img src="https://placekitten.com/800/800" alt="Placeholder">
  </div>

   <div class="instagram-item">
    <img src="https://placekitten.com/801/801" alt="Placeholder">
  </div>

</div>

<style>
.instagram-grid {
  display: grid;
  /* This creates 3 equal columns */
  grid-template-columns: repeat(3, 1fr);
  /* The gap between photos (Instagram uses about 3-5px) */
  gap: 4px; 
  padding-bottom: 50px;
}

.instagram-item {
  position: relative;
  width: 100%;
  /* This forces the box to be a perfect square */
  aspect-ratio: 1 / 1; 
  overflow: hidden;
  background: #f0f0f0;
}

.instagram-item img {
  width: 100%;
  height: 100%;
  /* This ensures the image covers the square without squishing/stretching */
  object-fit: cover; 
  transition: transform 0.3s ease;
  display: block;
}

/* Hover Effect: slight zoom */
.instagram-item:hover img {
  transform: scale(1.05);
  cursor: pointer;
}

/* Mobile responsiveness: switch to 2 columns on small screens */
@media (max-width: 768px) {
  .instagram-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>