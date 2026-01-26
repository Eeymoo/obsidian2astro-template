#!/usr/bin/env python3
"""
Tailwind CSS 风格校验器
检测样式是否符合项目规范：
1. 检测是否完全使用 Tailwind CSS 而不是自定义 CSS
2. 是否满足简约现代设计要求
"""

import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import argparse


class StyleValidator:
    """Tailwind CSS 样式校验器"""

    def __init__(self):
        # 正则表达式模式 - 重点是检测自定义 CSS
        self.patterns = {
            # 检测内联 style 属性（应该使用 Tailwind 工具类替代）
            'inline_style': r'style\s*=\s*["\'][^"\']*["\']',
            # 检测 <style> 标签（应该使用 Tailwind @apply 或工具类）
            'style_tag': r'<style[^>]*>',
            # 检测 @import 或外部 CSS 导入（应该使用 Tailwind）
            'css_import': r'@import|\.css["\']',
            # 检测过度的边框使用（简约风格应减少边框）
            'excessive_borders': r'border-\d+|border-[a-z]+',
            # 检测过度的阴影使用（简约风格应减少阴影）
            'excessive_shadows': r'shadow-[x]?l{2,}g|shadow-2xl',
            # 检测是否使用了非透明色的背景（现代风格应使用透明度）
            'non_transparent_bg': r'bg-(slate|gray|zinc|neutral|stone)-(?!\/)',
        }

    def validate_file(self, filepath: Path) -> Dict[str, List[Tuple[int, str]]]:
        """校验单个文件"""
        errors = {
            'inline_style': [],
            'style_tag': [],
            'css_import': [],
            'design_issues': [],
        }

        content = filepath.read_text()
        lines = content.split('\n')

        for line_num, line in enumerate(lines, 1):
            # 检查内联 style（应使用 Tailwind 工具类）
            if re.search(self.patterns['inline_style'], line, re.IGNORECASE):
                errors['inline_style'].append((line_num, line.strip()))

            # 检查 <style> 标签（应使用 Tailwind @apply 或工具类）
            if re.search(self.patterns['style_tag'], line, re.IGNORECASE):
                errors['style_tag'].append((line_num, line.strip()))

            # 检查 CSS import（应移除，使用 Tailwind）
            if re.search(self.patterns['css_import'], line, re.IGNORECASE):
                errors['css_import'].append((line_num, line.strip()))

            # 检查设计问题（简约现代风格）
            if re.search(self.patterns['excessive_borders'], line, re.IGNORECASE):
                errors['design_issues'].append((line_num, "过度使用边框，建议用留白代替"))

            if re.search(self.patterns['excessive_shadows'], line, re.IGNORECASE):
                errors['design_issues'].append((line_num, "过度使用阴影，简约风格应减少阴影"))

            if re.search(self.patterns['non_transparent_bg'], line, re.IGNORECASE):
                errors['design_issues'].append((line_num, "建议使用透明度背景，如 bg-slate/10"))

        return errors

    def validate_directory(self, dirpath: Path, patterns: Optional[List[str]] = None) -> Dict[str, Dict]:
        """校验目录"""
        if patterns is None:
            patterns = ['**/*.astro', '**/*.tsx', '**/*.jsx', '**/*.ts', '**/*.js']

        results = {}
        for pattern in patterns:
            for filepath in dirpath.glob(pattern):
                if filepath.is_file():
                    errors = self.validate_file(filepath)
                    if any(errors.values()):
                        results[str(filepath.relative_to(dirpath))] = errors

        return results

    def format_report(self, results: Dict[str, Dict]) -> str:
        """格式化报告"""
        if not results:
            return "✅ 所有文件通过风格校验！完全使用 Tailwind CSS，符合简约现代设计要求。"

        report = []
        report.append("❌ 发现风格问题：\n")

        for filepath, errors in results.items():
            report.append(f"\n📄 {filepath}:")

            if errors['inline_style']:
                report.append(f"\n  [inline_style] 发现 {len(errors['inline_style'])} 处内联样式：")
                report.append("    ⚠️ 应使用 Tailwind 工具类替代内联 style 属性")
                for line_num, line in errors['inline_style']:
                    report.append(f"    行 {line_num}: {line[:70]}...")

            if errors['style_tag']:
                report.append(f"\n  [style_tag] 发现 {len(errors['style_tag'])} 处 <style> 标签：")
                report.append("    ⚠️ 应使用 Tailwind @apply 或工具类组合")
                for line_num, line in errors['style_tag']:
                    report.append(f"    行 {line_num}: {line[:70]}...")

            if errors['css_import']:
                report.append(f"\n  [css_import] 发现 {len(errors['css_import'])} 处 CSS 导入：")
                report.append("    ⚠️ 项目应完全使用 Tailwind CSS，不导入外部 CSS")
                for line_num, line in errors['css_import']:
                    report.append(f"    行 {line_num}: {line[:70]}...")

            if errors['design_issues']:
                report.append(f"\n  [design_issues] 发现 {len(errors['design_issues'])} 处设计问题：")
                for line_num, issue in errors['design_issues']:
                    report.append(f"    行 {line_num}: {issue}")

        report.append("\n\n💡 修复建议：")
        report.append("1. 将所有内联 style 转换为 Tailwind 工具类")
        report.append("2. 移除 <style> 标签，使用 @apply 或工具类组合")
        report.append("3. 删除外部 CSS 导入，使用 Tailwind 替代")
        report.append("4. 简约设计：减少边框，用留白区分元素")
        report.append("5. 现代风格：使用透明度背景（如 bg-primary/10）")
        report.append("\n📚 Tailwind CSS 文档：https://tailwindcss.com")

        return '\n'.join(report)


def main():
    parser = argparse.ArgumentParser(description='Tailwind CSS 风格校验器')
    parser.add_argument('path', help='要校验的文件或目录路径')
    parser.add_argument('--patterns', '-p', nargs='+',
                        default=['**/*.astro', '**/*.tsx', '**/*.jsx'],
                        help='文件匹配模式')
    parser.add_argument('--json', action='store_true',
                        help='输出 JSON 格式报告')

    args = parser.parse_args()
    path = Path(args.path)

    if not path.exists():
        print(f"错误：路径不存在: {args.path}", file=sys.stderr)
        sys.exit(1)

    validator = StyleValidator()

    if path.is_file():
        results = {}
        errors = validator.validate_file(path)
        if any(errors.values()):
            results[str(path)] = errors
    else:
        results = validator.validate_directory(path, args.patterns)

    if args.json:
        import json
        print(json.dumps(results, indent=2))
    else:
        print(validator.format_report(results))

    # 返回非零退出码如果有错误
    sys.exit(1 if results else 0)


if __name__ == '__main__':
    main()
