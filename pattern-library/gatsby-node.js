const path = require(`path`)
const fs = require(`fs`)
const appRootDir = require(`app-root-dir`).get()
const { createFilePath } = require(`gatsby-source-filesystem`)

const componentPageTemplate = path.resolve(
  `src/templates/ComponentPage/index.js`
)

const docPageTemplate = path.resolve(`src/templates/Documentation/index.js`)
const tableOfContentsTemplate = path.resolve(`src/templates/TOC/index.js`)

// Adds a slug for documentation pages
function processDocNode({ node, getNode, boundActionCreators }) {
  if (node.internal.type !== `MarkdownRemark`) {
    return;
  }

  // Grab the parent node to determine filesystem information
  const fileNode = getNode(node.parent);

  if (fileNode.internal.type !== 'File') {
    return;
  }

  // Ensure this node is coming from our docs source
  if (fileNode.sourceInstanceName !== 'docs') {
    return;
  }

  // Create a slug from the filename removing the ordering prefix
  const slug = `${fileNode.name.replace(/^\d+-/,'')}`;

  const { createNodeField } = boundActionCreators;
  createNodeField({
    node,
    name: 'slug',
    value: slug,
  });
}

// Add a pattern-library specific componentId to make it easier to match up
// markdown README's with the docgen nodes from JS files.
function processComponentNode({ node, getNode, boundActionCreators }) {
  const { createNodeField } = boundActionCreators;

  if (node.internal.type !== 'MarkdownRemark' &&
     node.internal.type !== 'ComponentMetadata') {
    return;
  }

  // Grab the parent node to determine filesystem information
  const fileNode = getNode(node.parent);

  if (fileNode.internal.type !== 'File') {
    return;
  }

  // Ensure this node is coming from our components source
  if (fileNode.sourceInstanceName !== 'components') {
    return;
  }

  // Use the absolute path to the component's directory as the Id.
  const componentId = fileNode.dir;

  // Add `fields.componentId` to this node
  createNodeField({
    node,
    name: 'componentId',
    value: componentId,
  });
}

exports.onCreateNode = (arg) => {
  processDocNode(arg);
  processComponentNode(arg);
};


exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators

  return new Promise((resolve, reject) => {
    resolve(graphql(`
            {
              allMarkdownRemark(
                filter: { fileAbsolutePath: { regex: "/README.md/" } }
              ) {
                edges {
                  node {
                    fields {
                      componentId
                    }
                    fileAbsolutePath
                    html
                  }
                }
              }
              allComponentMetadata {
                edges {
                  node {
                    fields {
                      componentId
                    }
                    id
                    displayName
                    description {
                      text
                    }
                    props {
                      name
                      defaultValue {
                        value
                      }
                      type {
                        value
                        raw
                        name
                      }
                      description {
                        text
                      }
                      required
                    }
                  }
                }
              }
            }
      `)
        .then((result) => {
          if (result.errors) {
            throw new Error(result.errors);
          }

          // Include only components that have a README.md (as specified in the graphql query)
          const allComponents = result.data.allMarkdownRemark.edges.map((markdownEdge) => {
            // Match the README.md node with the docgen node based on componentId
            const componentId = markdownEdge.node.fields.componentId;
            const componentMetadataNode =
              result.data.allComponentMetadata.edges
                .map(edge => edge.node)
                .find(node => node.fields.componentId === componentId);

            return Object.assign({}, componentMetadataNode, {
              url: `/components/${componentMetadataNode.displayName.toLowerCase()}/`,
              html: markdownEdge.node.html,
            });
          });

          const exportFileContents =
            allComponents
              .reduce((accumulator, { id, displayName }) => {
                const absolutePath = id.replace(/ absPath of.*$/, ``)
                accumulator.push(
                  `export { default as ${displayName} } from "${absolutePath}"`
                )
                return accumulator
              }, [])
              .join(`\n`) + `\n`

          // Write components to cache for TOC
          fs.writeFileSync(
            path.join(appRootDir, `.cache/components.js`),
            exportFileContents
          )

          allComponents.forEach(data => {
            const { url } = data
            const context = Object.assign({}, data, {
              allComponents,
            })
            createPage({
              path: url,
              component: componentPageTemplate,
              context,
            })
          })

          createPage({
            path: `/components/`,
            component: tableOfContentsTemplate,
            context: {
              allComponents,
            },
          })
        })
        // Setup the doc pages
        .then(() =>
          graphql(`
            {
              allMarkdownRemark(
                filter: { fileAbsolutePath: { regex: "/\/docs\//" } }
              ) {
                edges {
                  node {
                    fields {
                      slug
                    }
                    html
                    frontmatter {
                      title
                      status
                    }
                  }
                }
              }
            }
        `))
        .then((result) => {
          if (result.errors) {
            throw new Error(result.errors);
          }

          result.data.allMarkdownRemark.edges.forEach((edge) => {
            const { html } = edge.node;
            const { title, status } = edge.node.frontmatter;
            const { slug } = edge.node.fields;

            const url = slug === 'index' ? `/docs/` : `/docs/${slug}/`;
            createPage({
              path: url,
              component: docPageTemplate,
              context: {
                title,
                status,
                html,
              },
            });
          });
        })
        .catch(err => {
          console.log(err)
          throw new Error(err)
        })
    )
  })

}
