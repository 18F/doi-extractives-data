import React from 'react';

const CategoryLayout = () => (
  <section className="layout-content container-page-wrapper landing-wrapper">
    <article className="container-left-8 container-shift-reverse-1">
      <a href="#" className="breadcrumb">Optional breadcrumb link</a>
      <h1 id="introduction">Page with categorical divisions</h1>
      <blockquote>
        <p>This page uses a grid of eight columns on the left and three on the right, with a one-column margin between. The right-side block can hold a sticky nav unit, or be left empty. This opening paragraph is a “blockquote,” which has this larger type style built in.</p>
      </blockquote>
      <section className="container">
        <h2 id="section-1" className="h2-bar">Page section one</h2>
        <div className="container landing-section">
          <div>
            <h3 className="h3 landing-heading"><a href="#">Topic</a></h3>
            <p>Short description of the content to be found in this topical subsection.</p>
            <p><a href="#">Additional link to topic</a></p>
          </div>
          <div>
            <h3 className="h3 landing-heading"><a href="#">Topic</a></h3>
            <p>Short description of the content to be found in this topical subsection.</p>
            <p><a href="#">Additional link to topic</a></p>
          </div>
          <div>
            <h3 className="h3 landing-heading"><a href="#">Topic</a></h3>
            <p>Short description of the content to be found in this topical subsection.</p>
            <p><a href="#">Additional link to topic</a></p>
          </div>
          <div>
            <h3 className="h3 landing-heading"><a href="#">Topic</a></h3>
            <p>Short description of the content to be found in this topical subsection.</p>
            <p><a href="#">Additional link to topic</a></p>
          </div>
        </div>
      </section>
      <section className="container">
        <h2 id="section-2" className="h2-bar">Page section two</h2>
        <div className="container landing-section">
          <div>
            <h3 className="h3 landing-heading"><a href="#">Topic</a></h3>
            <p>Short description of the content to be found in this topical subsection.</p>
            <p><a href="#">Additional link to topic</a></p>
          </div>
          <div>
            <h3 className="h3 landing-heading"><a href="#">Topic</a></h3>
            <p>Short description of the content to be found in this topical subsection.</p>
            <p><a href="#">Additional link to topic</a></p>
          </div>
          <div>
            <h3 className="h3 landing-heading"><a href="#">Topic</a></h3>
            <p>Short description of the content to be found in this topical subsection.</p>
            <p><a href="#">Additional link to topic</a></p>
          </div>
        </div>
      </section>
    </article>

      <div className="pre-sticky pre-sticky-small" />
      <nav className="sticky sticky-float sticky_nav">
        <ul>
          <a href="#" className="sticky_nav-nav_item" data-nav-item="intro" data-active="true">Top</a>
          <a href="#section-1" className="sticky_nav-nav_item" data-nav-item="page-section-one" data-active="false">Page section one</a>
          <a href="#section-2" className="sticky_nav-nav_item" data-nav-item="footnote-examples" data-active="false">Page section two</a>
        </ul>
      </nav>
  </section>
);


export default CategoryLayout;
