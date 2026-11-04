---
layout: page
title: demo
permalink: /demo/
description: Interactive tools from my research that you can try in your browser.
nav: true
nav_order: 4
search: false
---

<style>
  .demos { max-width: 760px; }
  .demo-card {
    border: 1px solid var(--global-divider-color);
    border-radius: 8px;
    background-color: var(--global-card-bg-color);
    padding: 1.1rem 1.25rem 1.2rem;
    margin-bottom: 1rem;
    transition: border-color 0.2s ease;
  }
  .demo-card:hover { border-color: var(--global-theme-color); }
  .demo-card .head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.3rem 1rem;
  }
  .demo-card h3 { font-size: 1.15rem; font-weight: 600; margin: 0; }
  .demo-card .meta {
    color: var(--global-theme-color);
    font-weight: 500;
    font-size: 0.82rem;
    white-space: nowrap;
  }
  .demo-card p { font-weight: 300; margin: 0.6rem 0 0; }
  .demo-card ul { font-weight: 300; margin: 0.5rem 0 0; padding-left: 1.2rem; }
  .demo-card .actions { display: flex; flex-wrap: wrap; gap: 0.6rem 1.2rem; align-items: center; margin-top: 0.9rem; }
  .demo-card .btn-open {
    display: inline-block;
    background-color: var(--global-theme-color);
    color: #fff !important;
    font-weight: 600;
    padding: 0.45rem 1rem;
    border-radius: 6px;
    text-decoration: none;
  }
  .demo-card .btn-open:hover { filter: brightness(1.08); text-decoration: none; }
</style>

<div class="demos">

<div class="demo-card">
  <div class="head">
    <h3>EPICS PV Benchmark</h3>
    <span class="meta">IPAC&rsquo;26 · MOP6321</span>
  </div>
  <p>Can a language model turn an operator&rsquo;s request, like &ldquo;what&rsquo;s the vacuum pressure in arc 3?&rdquo;, into the exact control-system channel name? Try the two benchmark tasks from my paper with your own model:</p>
  <ul>
    <li><strong>PV name prediction:</strong> the model names the channel(s) for a query, with or without hints.</li>
    <li><strong>Token graph reconstruction:</strong> the model works out how naming pieces fit together, drawn as a graph.</li>
  </ul>
  <p>It runs entirely in your browser with any OpenAI-compatible API key and keeps a history of your results. It comes with a made-up example dataset, or you can load your own.</p>
  <div class="actions">
    <a class="btn-open" href="https://amyawu.github.io/als-language-model-evaluation/">Open the demo</a>
    <a href="https://indico.jacow.org/event/95/contributions/12471/attachments/1330/8600/MOP6321_edited_version.pdf">Paper</a>
    <a href="https://github.com/amyawu/als-language-model-evaluation">Code</a>
  </div>
</div>

</div>
