import type { DesignSpecification, Screenshot } from '../types';

export const generateMarkdown = (screenshot: Screenshot): string => {
    if (!screenshot.designSpecs) {
        return `# ${screenshot.title}\n\nNo AI analysis data available.`;
    }

    const { designSpecs } = screenshot;
    let md = `# Design Specifications: ${screenshot.title}\n\n`;

    // General Info
    md += `## 📋 General Info\n`;
    md += `- **Design Style**: ${designSpecs.generalDesignInfo.perceivedStyle}\n`;
    md += `- **Layout**: ${designSpecs.layoutStructure.description}\n`;
    md += `- **Notes**: ${designSpecs.generalDesignInfo.notes}\n\n`;

    // Color Palette
    if (designSpecs.colorPalette?.length > 0) {
        md += `## 🎨 Color Palette\n`;
        md += `| Hex     | Role       |\n`;
        md += `|---------|------------|\n`;
        designSpecs.colorPalette.forEach(color => {
            md += `| \`${color.hex}\` | ${color.role} |\n`;
        });
        md += `\n`;
    }

    // Typography
    if (designSpecs.typography?.length > 0) {
        md += `## ✒️ Typography\n`;
        designSpecs.typography.forEach(typo => {
            md += `### ${typo.context}\n`;
            md += `- **Font Family**: ${typo.fontFamily}\n`;
            md += `- **Font Size**: ${typo.fontSize}\n`;
            md += `- **Font Weight**: ${typo.fontWeight}\n`;
            md += `- **Color**: \`${typo.colorHex}\`\n\n`;
        });
    }

    // UI Components
    if (designSpecs.uiComponents?.length > 0) {
        md += `## 🧩 UI Components\n`;
        designSpecs.uiComponents.forEach(comp => {
            md += `### ${comp.type} \n`;
            if (comp.label) {
                md += `- **Label**: "${comp.label}"\n`;
            }
            if (comp.properties && Object.keys(comp.properties).length > 0) {
                md += `- **Properties**:\n`;
                for (const [key, value] of Object.entries(comp.properties)) {
                    if (value) md += `  - \`${key}\`: \`${value}\`\n`;
                }
            }
            md += `\n`;
        });
    }

    return md;
};
