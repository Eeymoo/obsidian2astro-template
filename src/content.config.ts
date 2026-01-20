import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string().optional(),
			// Transform string to Date object
			date:  z.coerce.date(),
			updated: z.coerce.date().optional(),
			heroImage: image().optional(),
			uri: z.string().optional(),
			hidden: z.boolean().optional(),
			tags: z.array(z.string()).optional(),
			categories:  z.string().optional(),
		}),
});

export const collections = { blog };
