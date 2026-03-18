import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Element, Root } from 'hast';

const rehypeZoomImages: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'img') return;
      
      const props = node.properties || {};
      const src = props.src as string | undefined;
      const alt = props.alt as string | undefined;
      const width = props.width as number | string | undefined;
      const height = props.height as number | string | undefined;
      const className = props.class as string | string[] | undefined;
      
      if (!src) return;
      
      const numericWidth = typeof width === 'string' ? parseInt(width, 10) : width;
      const numericHeight = typeof height === 'string' ? parseInt(height, 10) : height;
      const isIcon = (numericWidth !== undefined && numericWidth < 200) || 
                      (numericHeight !== undefined && numericHeight < 200);
      
      const wrapperClasses = ['zoom-image-wrapper', 'relative', 'inline-block'];
      if (className) {
        wrapperClasses.push(typeof className === 'string' ? className : className.join(' '));
      }
      
      const imgClasses = ['zoom-image-target'];
      if (!isIcon) {
        imgClasses.push('cursor-pointer');
      }
      
      node.properties = {
        ...props,
        class: imgClasses.join(' '),
        loading: 'lazy',
      };
      
      const portalDiv: Element = {
        type: 'element',
        tagName: 'div',
        properties: {
          class: 'zoom-image-portal hidden fixed z-50 pointer-events-none',
          'data-zoom-portal': '',
        },
        children: [
          {
            type: 'element',
            tagName: 'img',
            properties: {
              src,
              alt: alt || '',
              class: 'max-w-none rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700',
              'data-zoom-image': '',
            },
            children: [],
          },
        ],
      };
      
      node.tagName = 'div';
      node.properties = {
        class: wrapperClasses.join(' '),
        'data-is-icon': isIcon ? 'true' : 'false',
      };
      node.children = [node, portalDiv] as any;
    });
  };
};

export default rehypeZoomImages;
