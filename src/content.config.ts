import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			// description: z.string().optional(),
			// Transform string to Date object
			// pubDate: z.coerce.date(),
			date:  z.coerce.date(),
			updated: z.coerce.date().optional(),
			heroImage: image().optional(),
			// uri: z.string() // 强制要求文章必须包含 uri 字段，否则校验失败
		}),
});

export const collections = { blog };
