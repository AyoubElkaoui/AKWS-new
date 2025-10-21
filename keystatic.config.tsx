import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    blog: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ 
          name: { 
            label: 'Titel',
            validation: { isRequired: true }
          } 
        }),
        description: fields.text({ 
          label: 'Beschrijving (SEO)',
          multiline: true,
          validation: { isRequired: true }
        }),
        pubDate: fields.datetime({ 
          label: 'Publicatiedatum',
          defaultValue: { kind: 'now' }
        }),
        author: fields.text({ 
          label: 'Auteur',
          defaultValue: 'Ayoub Elkaoui'
        }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          { 
            label: 'Tags',
            itemLabel: props => props.value,
            validation: { length: { min: 1 } }
          }
        ),
        featured: fields.checkbox({ 
          label: 'Uitgelicht op homepagina',
          defaultValue: false
        }),
        content: fields.mdx({
          label: 'Inhoud',
          options: {
            heading: [1, 2, 3, 4],
            bold: true,
            italic: true,
            link: true,
            code: true,
            codeBlock: true,
            blockquote: true,
            orderedList: true,
            unorderedList: true,
            table: true,
          },
        }),
      },
    }),
  },
});
