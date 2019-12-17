import React from 'react'
import Link from '../../utils/temp-link'

import styles from './WhatsNew.module.css'

const WhatsNew = props => (
  <section className={styles.root + ' slab-delta'}>
  	<div className="container-page-wrapper">
      <h2>What's new</h2>
      <p>In our latest release on December 18, 2019, we made the following changes:</p>
      <ul className="list-bullet ribbon-card-top-list">
        <li>Added monthly disbursements data for October 2019</li>
        <li>Added monthly production data for August 2019</li>
        <li>Added monthly revenue data for November 2019</li>
        <li>Added supporting information about <Link to="/how-it-works/reclamation-fund/">Reclamation Fund disbursements</Link></li>
      </ul>

      <p>Review our <a href="https://github.com/ONRR/doi-extractives-data/releases">full release details</a>.</p>
    </div>
  </section>
)

export default WhatsNew
