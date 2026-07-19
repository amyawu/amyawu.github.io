---
layout: page
title: projects
permalink: /projects/
description: My latest contributions at Berkeley Lab's Advanced Light Source.
nav: true
nav_order: 3
search: false
---

<style>
  .contributions { max-width: 760px; }
  .contributions details {
    border: 1px solid var(--global-divider-color);
    border-radius: 8px;
    margin-bottom: 0.9rem;
    background-color: var(--global-card-bg-color);
    transition: border-color 0.2s ease;
  }
  .contributions details[open] { border-color: var(--global-theme-color); }
  .contributions summary {
    cursor: pointer;
    list-style: none;
    padding: 0.9rem 1.1rem;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    font-weight: 600;
  }
  .contributions summary::-webkit-details-marker { display: none; }
  .contributions summary::before {
    content: "\25B8";
    color: var(--global-theme-color);
    margin-right: 0.55rem;
    display: inline-block;
    transition: transform 0.2s ease;
  }
  .contributions details[open] summary::before { transform: rotate(90deg); }
  .contributions summary .title { flex: 1; }
  .contributions summary .meta {
    color: var(--global-theme-color);
    font-weight: 500;
    font-size: 0.82rem;
    white-space: nowrap;
  }
  .contributions .body {
    padding: 0 1.1rem 1.1rem 2.25rem;
    font-weight: 300;
  }
</style>

<div class="contributions">

<details open>
  <summary>
    <span class="title">3D Magnetic Modeling &amp; Digital Twins</span>
    <span class="meta">Advanced Light Source · 2026–now</span>
  </summary>
  <div class="body">
    <p>I build 3D magnetic models of the Advanced Light Source's quadrupole and BendA magnets in Radia, mapping their fields for beamline diagnostics. These models feed a digital twin supporting the <a href="https://als.lbl.gov/als-u/overview/">ALS-U upgrade</a>.</p>
  </div>
</details>

<details>
  <summary>
    <span class="title">Evaluating Language Models for Accelerators</span>
    <span class="meta">DOE Internship · ALS · 2026</span>
  </summary>
  <div class="body">
    <p>I benchmarked commercial frontier, reasoning-specific, and lab-hosted LLMs on their ability to understand and reason about the Advanced Light Source. The study anchors a first-author paper under review at IPAC&rsquo;26.</p>
  </div>
</details>

<details>
  <summary>
    <span class="title">Agentic AI for User Facilities</span>
    <span class="meta">DOE · ALS · 2026</span>
  </summary>
  <div class="body">
    <p>I co-authored a Department of Energy workshop report on deploying agentic AI across scientific user facilities (<a href="https://doi.org/10.1080/08940886.2026.2649097">Synchrotron Radiation News</a>), and contributed to Osprey, a production framework for agentic AI in accelerator control systems.</p>
  </div>
</details>

</div>
