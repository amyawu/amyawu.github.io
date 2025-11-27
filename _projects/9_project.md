---
layout: page
title: Photography
description: "Edits & Retouching"
img: assets/img/squirrel1_small.jpg
importance: 5
category: fun
---

<div class="instagram-grid">

  <div class="instagram-item" 
       onclick="openModal(this)"
       data-title="Squirrel Retouch"
       data-desc="Removed distracting leaves and color graded for warmth."
       data-after="/assets/img/squirrel1_small.jpg" 
       data-before="https://placekitten.com/800/800"> <img src="/assets/img/squirrel1_small.jpg" alt="Squirrel">
    <div class="icon-overlay">🔍 Compare</div>
  </div>

  <div class="instagram-item" 
       onclick="openModal(this)"
       data-title="Portrait Cleanup"
       data-desc="Skin texture cleanup and eye sharpening."
       data-after="https://placekitten.com/801/801"
       data-before="https://placekitten.com/802/802">
       
    <img src="https://placekitten.com/801/801" alt="Portrait">
    <div class="icon-overlay">🔍 Compare</div>
  </div>

  </div>


<div id="imageModal" class="modal">
  <span class="close" onclick="closeModal()">&times;</span>
  
  <div class="modal-content">
    <h2 id="modalTitle">Project Title</h2>
    <p id="modalDesc">Description goes here</p>

    <div class="comparison-row">
      <div class="img-box">
        <span class="label">✨ Final Edit</span>
        <img id="imgAfter" src="" alt="After">
      </div>
      <div class="img-box">
        <span class="label">📷 Original / Raw</span>
        <img id="imgBefore" src="" alt="Before">
      </div>
    </div>
  </div>
</div>


<style>
/* --- Grid Styles --- */
.instagram-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding-bottom: 50px;
}

.instagram-item {
  position: relative;
  aspect-ratio: 1 / 1;
  cursor: pointer;
  overflow: hidden;
  border-radius: 4px;
}

.instagram-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.instagram-item:hover img {
  transform: scale(1.05);
  filter: brightness(0.7);
}

/* The "Compare" text that appears on hover */
.icon-overlay {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.instagram-item:hover .icon-overlay {
  opacity: 1;
}

/* --- Modal/Popup Styles --- */
.modal {
  display: none; /* Hidden by default */
  position: fixed;
  z-index: 9999;
  left: 0; top: 0;
  width: 100%; height: 100%;
  background-color: rgba(0,0,0,0.9);
  overflow-y: auto; /* Allow scrolling if images are tall */
}

.modal-content {
  margin: 5% auto;
  padding: 20px;
  width: 90%;
  max-width: 1200px;
  text-align: center;
  color: white;
}

.close {
  position: absolute;
  top: 20px; right: 35px;
  color: #f1f1f1;
  font-size: 40px;
  font-weight: bold;
  cursor: pointer;
}

/* Side-by-side comparison */
.comparison-row {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  justify-content: center;
}

.img-box {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.img-box img {
  width: 100%;
  border-radius: 4px;
  border: 1px solid #555;
}

.label {
  display: block;
  margin-bottom: 5px;
  font-size: 0.9em;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Mobile: Stack images instead of side-by-side */
@media (max-width: 768px) {
  .instagram-grid { grid-template-columns: repeat(2, 1fr); }
  .comparison-row { flex-direction: column; }
}
</style>


<script>
function openModal(element) {
  // Get data from the clicked item
  var title = element.getAttribute("data-title");
  var desc = element.getAttribute("data-desc");
  var afterSrc = element.getAttribute("data-after");
  var beforeSrc = element.getAttribute("data-before");

  // Inject into modal
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalDesc").innerText = desc;
  document.getElementById("imgAfter").src = afterSrc;
  document.getElementById("imgBefore").src = beforeSrc;

  // Show modal
  document.getElementById("imageModal").style.display = "block";
}

function closeModal() {
  document.getElementById("imageModal").style.display = "none";
}

// Close modal if clicking outside the image area
window.onclick = function(event) {
  var modal = document.getElementById("imageModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
</script>