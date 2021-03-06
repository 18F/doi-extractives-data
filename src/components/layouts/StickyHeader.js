import React from 'react'

const StickyHeader = props => {
  const headerClassNames = { 'className': ' sticky-header-wrapper flex-row ' }
  const spanClassNames = { 'className': ' flex-row-flex ' }

  return (
    (() => {
      switch (props.headerSize) {
      case 'h2':
        return (
          <h2 id={props.headerId} {...headerClassNames} alt={props.alt}>
            <span {...spanClassNames}>{props.headerText}</span>
            {props.children}
          </h2>)
      case 'h4':
        return (
          <h4 id={props.headerId} {...headerClassNames} alt={props.alt}>
            <span {...spanClassNames}>{props.headerText}</span>
            {props.children}
          </h4>)
      default:
        return (
          <h3 id={props.headerId} {...headerClassNames} alt={props.alt}>
            <span {...spanClassNames}>{props.headerText}</span>
            {props.children}
          </h3>)
      }
    })()
  )
}

export default StickyHeader
